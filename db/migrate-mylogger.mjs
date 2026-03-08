/**
 * Migration: mylogger (MySQL) → personal_erp (PostgreSQL)
 * Strategy: GROUP rows by (info, added_date) so one note with N tags
 *           becomes ONE event with N EventTag rows (not N events).
 * Run: node db/migrate-mylogger.mjs
 *
 * Idempotent: uses ON CONFLICT (userId, source, sourceRef) DO NOTHING
 * sourceRef = mylogger:note:{minId}  (min row-id of the group = stable key)
 */
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';

const USER_ID = 'ebab9ce0-ce1a-4718-aecf-8111abbb4a3b';
const SQL_FILE = '/tmp/erp-migration.sql';

const MY_CMD = (sql) =>
  execSync(`mysql -u root --batch --skip-column-names mylogger -e "SET SESSION sql_mode=''; ${sql.replace(/"/g, '\\"')}"`, {
    encoding: 'utf8',
    maxBuffer: 200 * 1024 * 1024,
  });

function pgEsc(str) {
  if (str === null || str === undefined || str === 'NULL') return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

const lines = [];
lines.push('BEGIN;');

// ── Phase 1: Collect all rows grouped by (info, added_date) ──────────────────
console.log('Reading mylogger rows...');
const rows = MY_CMD(`
  SELECT
    MIN(id) as min_id,
    info,
    GROUP_CONCAT(DISTINCT tag ORDER BY tag SEPARATOR '\t') as tags,
    NULLIF(MIN(NULLIF(added_date, '0000-00-00 00:00:00')), '0000-00-00 00:00:00') as added_date,
    NULLIF(MIN(NULLIF(completed_date, '0000-00-00 00:00:00')), '0000-00-00 00:00:00') as completed_date
  FROM info_list
  GROUP BY info, added_date
  ORDER BY min_id
`).trim().split('\n');

console.log(`  ${rows.length} unique notes after grouping`);

// ── Phase 2: Build tag set ────────────────────────────────────────────────────
console.log('Collecting tags...');
const allTagNames = new Set(['done']);
for (const row of rows) {
  const cols = row.split('\t');
  if (cols.length < 3) continue;
  const tags = (cols[2] || '').split('\t').map(t => t.trim()).filter(Boolean);
  for (const t of tags) allTagNames.add(t.toLowerCase());
}

const tagMap = {};
const tagValues = [];
for (const tag of allTagNames) {
  const id = randomUUID();
  tagMap[tag] = id;
  tagValues.push(`(${pgEsc(id)}, ${pgEsc(USER_ID)}, ${pgEsc(tag)}, now())`);
}

lines.push(`INSERT INTO "Tag" (id, "userId", name, "createdAt") VALUES`);
lines.push(tagValues.join(',\n') + ' ON CONFLICT DO NOTHING;');
console.log(`  ${tagValues.length} tags`);

// ── Phase 3: Events + EventTags ───────────────────────────────────────────────
console.log('Building events + event-tags...');
const eventValues = [];
const etValues = [];
let doneCount = 0;
let skipped = 0;

for (const row of rows) {
  const cols = row.split('\t');
  // min_id | info | tags(tab-sep) | added_date | completed_date
  if (cols.length < 3) { skipped++; continue; }
  const [minId, info, tagsRaw, addedDate, completedDate] = cols;

  const sourceRef = `mylogger:note:${minId}`;
  const isValidDate = (d) => d && d !== 'NULL' && !d.startsWith('0000-00-00');
  const occurred = isValidDate(addedDate) ? addedDate : new Date().toISOString();

  const eventId = randomUUID();
  eventValues.push(
    `(${pgEsc(eventId)}, ${pgEsc(USER_ID)}, ${pgEsc(occurred)}, ${pgEsc(occurred)}, ${pgEsc(info)}, 'mylogger', ${pgEsc(sourceRef)}, ${pgEsc(occurred)}, ${pgEsc(occurred)})`
  );

  // All tags for this note
  const noteTags = (tagsRaw || '').split('\t').map(t => t.trim().toLowerCase()).filter(Boolean);
  for (const t of noteTags) {
    if (tagMap[t]) {
      etValues.push(`(${pgEsc(randomUUID())}, ${pgEsc(eventId)}, ${pgEsc(tagMap[t])})`);
    }
  }

  // Add 'done' tag if completed
  if (isValidDate(completedDate)) {
    etValues.push(`(${pgEsc(randomUUID())}, ${pgEsc(eventId)}, ${pgEsc(tagMap['done'])})`);
    doneCount++;
  }
}

const CHUNK = 1000;
for (let i = 0; i < eventValues.length; i += CHUNK) {
  lines.push(`INSERT INTO "Event" (id, "userId", "occurredAt", "ingestedAt", content, source, "sourceRef", "createdAt", "updatedAt") VALUES`);
  lines.push(eventValues.slice(i, i + CHUNK).join(',\n') + ' ON CONFLICT ("userId", source, "sourceRef") DO NOTHING;');
}
for (let i = 0; i < etValues.length; i += CHUNK) {
  lines.push(`INSERT INTO "EventTag" (id, "eventId", "tagId") VALUES`);
  lines.push(etValues.slice(i, i + CHUNK).join(',\n') + ' ON CONFLICT DO NOTHING;');
}

lines.push('COMMIT;');
lines.push(`SELECT tbl, COUNT(*) FROM (
  SELECT 'Event' as tbl, id FROM "Event"
  UNION ALL SELECT 'Tag', id FROM "Tag"
) x GROUP BY tbl ORDER BY tbl;`);

console.log(`  ${eventValues.length} events`);
console.log(`  ${etValues.length} event-tags (${doneCount} done-tagged)`);
if (skipped) console.log(`  ${skipped} rows skipped (malformed)`);

writeFileSync(SQL_FILE, lines.join('\n'));
console.log(`SQL written: ${SQL_FILE}`);

// ── Phase 4: Execute ──────────────────────────────────────────────────────────
console.log('Copying SQL into container...');
execSync(`docker cp ${SQL_FILE} personal-erp_postgres_1:/tmp/erp-migration.sql`, { encoding: 'utf8' });

console.log('Executing inside container...');
const result = execSync(
  `docker exec personal-erp_postgres_1 psql -U personal_erp -d personal_erp -f /tmp/erp-migration.sql`,
  { encoding: 'utf8', timeout: 300000 }
);
console.log(result.slice(-2000));
console.log('=== Migration complete ===');
