/**
 * Re-link events that have no EventTag due to tag case mismatches in migration.
 * Uses MySQL as source of truth to find each event's original tag.
 */
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

const USER_ID = 'ebab9ce0-ce1a-4718-aecf-8111abbb4a3b';
const SQL_FILE = '/tmp/fix-missing-tags.sql';

const MY = (sql) =>
  execSync(`mysql -u root --batch --skip-column-names -e "SET SESSION sql_mode=''; ${sql.replace(/"/g, '\\"')}" mylogger`, {
    encoding: 'utf8', maxBuffer: 200 * 1024 * 1024,
  });

function pgEsc(str) {
  if (!str && str !== 0) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

console.log('Fetching MySQL rows with tags...');
const rows = MY('SELECT id, LOWER(TRIM(NULLIF(tag, ""))) as tag FROM info_list WHERE tag IS NOT NULL AND tag != "" AND tag != "0000-00-00 00:00:00"')
  .trim().split('\n');

console.log(`MySQL rows: ${rows.length}`);

const values = [];
for (const row of rows) {
  const parts = row.split('\t');
  if (parts.length < 2) continue;
  const [mlId, tag] = parts;
  if (!tag || !tag.trim()) continue;
  values.push(`('mylogger:info_list:${mlId.trim()}', ${pgEsc(tag.trim())})`);
}

console.log(`Building SQL for ${values.length} source rows...`);

const CHUNK = 5000;
const sqlParts = ['BEGIN;'];

for (let i = 0; i < values.length; i += CHUNK) {
  const chunk = values.slice(i, i + CHUNK);
  sqlParts.push(`
INSERT INTO "EventTag" (id, "eventId", "tagId")
SELECT gen_random_uuid()::text, e.id, t.id
FROM (VALUES ${chunk.join(',')}) AS v(sourceref, tagname)
JOIN "Event" e ON e."sourceRef" = v.sourceref
JOIN "Tag" t ON t.name = v.tagname AND t."userId" = ${pgEsc(USER_ID)}
WHERE NOT EXISTS (
  SELECT 1 FROM "EventTag" et WHERE et."eventId" = e.id AND et."tagId" = t.id
);`);
}

sqlParts.push('COMMIT;');
sqlParts.push(`
SELECT 'Events with no tag' as metric, COUNT(*) FROM "Event" e WHERE NOT EXISTS (SELECT 1 FROM "EventTag" et WHERE et."eventId" = e.id)
UNION SELECT 'Total EventTags', COUNT(*) FROM "EventTag"
UNION SELECT 'life tag count', COUNT(et.id) FROM "Tag" t JOIN "EventTag" et ON et."tagId"=t.id WHERE t.name='life';
`);

writeFileSync(SQL_FILE, sqlParts.join('\n'));
console.log(`SQL written. Copying to container...`);

execSync(`docker cp ${SQL_FILE} personal-erp_postgres_1:/tmp/fix-missing-tags.sql`);
console.log('Executing...');
const result = execSync(
  `docker exec personal-erp_postgres_1 psql -U personal_erp -d personal_erp -f /tmp/fix-missing-tags.sql`,
  { encoding: 'utf8', timeout: 120000 }
);
console.log(result.slice(-2000));
console.log('Done.');
