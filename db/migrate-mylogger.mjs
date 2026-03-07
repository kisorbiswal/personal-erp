/**
 * Migration: mylogger (MySQL) → personal_erp (PostgreSQL)
 * Strategy: generate one big SQL file, pipe it in one shot (fast)
 * Run: node db/migrate-mylogger.mjs
 */
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';

const USER_ID = 'ebab9ce0-ce1a-4718-aecf-8111abbb4a3b';
const SQL_FILE = '/tmp/erp-migration.sql';

const MY_CMD = (sql) =>
  execSync(`mysql -u root --batch --skip-column-names mylogger -e "SET SESSION sql_mode=''; ${sql.replace(/"/g, '\\"')}"`, {
    encoding: 'utf8',
    maxBuffer: 200 * 1024 * 1024 // 200MB — 29k rows can be large
  });

function pgEsc(str) {
  if (str === null || str === undefined || str === 'NULL') return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

const lines = [];
lines.push('BEGIN;');

// ── Phase 1: Tags ─────────────────────────────────────────────────────────────
console.log('Building tags SQL...');
const tagRows = MY_CMD("SELECT DISTINCT tag FROM info_list WHERE tag IS NOT NULL AND tag != ''")
  .trim().split('\n').map(t => t.trim()).filter(Boolean);
tagRows.push('DONE');

const tagMap = {};
const tagValues = [];
for (const tag of tagRows) {
  const id = randomUUID();
  tagMap[tag] = id;
  tagValues.push(`(${pgEsc(id)}, ${pgEsc(USER_ID)}, ${pgEsc(tag)}, now())`);
}
lines.push(`INSERT INTO "Tag" (id, "userId", name, "createdAt") VALUES`);
lines.push(tagValues.join(',\n') + ' ON CONFLICT DO NOTHING;');
console.log(`  ${tagValues.length} tags`);

// ── Phase 2: Events + EventTags ───────────────────────────────────────────────
console.log('Building events SQL...');
const rows = MY_CMD("SELECT id, info, tag, NULLIF(added_date, '0000-00-00 00:00:00') as added_date, NULLIF(completed_date, '0000-00-00 00:00:00') as completed_date FROM info_list ORDER BY id")
  .trim().split('\n');

const eventValues = [];
const etValues = [];
let doneCount = 0;

for (const row of rows) {
  const cols = row.split('\t');
  if (cols.length < 4) continue;
  const [mlId, info, tag, addedDate, completedDate] = cols;
  const eventId = randomUUID();
  const sourceRef = `mylogger:info_list:${mlId}`;
  const isValidDate = (d) => d && d !== 'NULL' && !d.startsWith('0000-00-00');
  const occurred = isValidDate(addedDate) ? addedDate : new Date().toISOString();

  eventValues.push(`(${pgEsc(eventId)}, ${pgEsc(USER_ID)}, ${pgEsc(occurred)}, ${pgEsc(occurred)}, ${pgEsc(info)}, 'mylogger', ${pgEsc(sourceRef)}, ${pgEsc(occurred)}, ${pgEsc(occurred)})`);

  const tagId = tagMap[tag?.trim()];
  if (tagId) {
    etValues.push(`(${pgEsc(randomUUID())}, ${pgEsc(eventId)}, ${pgEsc(tagId)})`);
  }

  if (completedDate && completedDate !== 'NULL' && completedDate.trim() !== '' && !completedDate.startsWith('0000-00-00')) {
    etValues.push(`(${pgEsc(randomUUID())}, ${pgEsc(eventId)}, ${pgEsc(tagMap['DONE'])})`);
    doneCount++;
  }
}

// Split into chunks to avoid hitting PG's max statement size
const CHUNK = 1000;
for (let i = 0; i < eventValues.length; i += CHUNK) {
  lines.push(`INSERT INTO "Event" (id, "userId", "occurredAt", "ingestedAt", content, source, "sourceRef", "createdAt", "updatedAt") VALUES`);
  lines.push(eventValues.slice(i, i + CHUNK).join(',\n') + ';');
}
for (let i = 0; i < etValues.length; i += CHUNK) {
  lines.push(`INSERT INTO "EventTag" (id, "eventId", "tagId") VALUES`);
  lines.push(etValues.slice(i, i + CHUNK).join(',\n') + ';');
}

lines.push('COMMIT;');
lines.push(`SELECT 'User' as tbl, COUNT(*) FROM "User" UNION SELECT 'Tag', COUNT(*) FROM "Tag" UNION SELECT 'Event', COUNT(*) FROM "Event" UNION SELECT 'EventTag', COUNT(*) FROM "EventTag" ORDER BY tbl;`);

console.log(`  ${eventValues.length} events`);
console.log(`  ${etValues.length} event-tags (${doneCount} DONE tags)`);

writeFileSync(SQL_FILE, lines.join('\n'));
console.log(`SQL file written: ${SQL_FILE}`);

// ── Phase 3: Execute ──────────────────────────────────────────────────────────
console.log('Copying SQL file into container...');
execSync(`docker cp ${SQL_FILE} personal-erp_postgres_1:/tmp/erp-migration.sql`, { encoding: 'utf8' });

console.log('Executing SQL inside container...');
const result = execSync(
  `docker exec personal-erp_postgres_1 psql -U personal_erp -d personal_erp -f /tmp/erp-migration.sql`,
  { encoding: 'utf8', timeout: 300000 }
);
console.log(result.slice(-2000)); // print last part (verification query output)
console.log('=== Migration complete ===');
