/**
 * Fix tag case issues:
 * 1. Normalize all tags to lowercase (DONE→done, Life→life, etc.)
 * 2. Re-link events that have no EventTag (case-mismatch in migration)
 */
import { execSync } from 'child_process';
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';

const USER_ID = 'ebab9ce0-ce1a-4718-aecf-8111abbb4a3b';
const SQL_FILE = '/tmp/fix-tag-case.sql';

const PG = (sql) =>
  execSync(`docker exec personal-erp_postgres_1 psql -U personal_erp -d personal_erp -c ${JSON.stringify(sql)}`, { encoding: 'utf8' });

const MY = (sql) =>
  execSync(`mysql -u root --batch --skip-column-names -e "SET SESSION sql_mode=''; ${sql.replace(/"/g, '\\"')}" mylogger`, {
    encoding: 'utf8',
    maxBuffer: 200 * 1024 * 1024,
  });

function pgEsc(str) {
  if (str === null || str === undefined || str === 'NULL') return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

console.log('=== Step 1: Merge duplicate tags (normalize to lowercase) ===');
// For each pair of (userId, LOWER(name)) that has multiple tags,
// keep one (lowest id), update EventTag refs, delete the rest
const lines = ['BEGIN;'];

// Step 1: Get all tags that would collide after lowercase normalization
const dupCheck = PG(`
  SELECT LOWER(name) as lname, COUNT(*), MIN(id) as keep_id, array_agg(id) as all_ids
  FROM "Tag" WHERE "userId" = '${USER_ID}'
  GROUP BY LOWER(name)
  HAVING COUNT(*) > 1;
`);
console.log('Duplicates after lowercase normalization:', dupCheck);

// Step 2: Normalize one by one using SQL
lines.push(`
-- Re-point EventTags from case-variant tags to their lowercase canonical version
-- First, update all EventTag rows to point to the tag with the lowest id in the group
WITH canonical AS (
  SELECT LOWER(name) as lname, MIN(id) as keep_id
  FROM "Tag"
  WHERE "userId" = ${pgEsc(USER_ID)}
  GROUP BY LOWER(name)
),
tag_map AS (
  SELECT t.id as old_id, c.keep_id as new_id
  FROM "Tag" t
  JOIN canonical c ON LOWER(t.name) = c.lname
  WHERE t.id != c.keep_id
)
UPDATE "EventTag" et
SET "tagId" = tm.new_id
FROM tag_map tm
WHERE et."tagId" = tm.old_id;

-- Delete the non-canonical (duplicate) tags
DELETE FROM "Tag" t
WHERE "userId" = ${pgEsc(USER_ID)}
  AND id NOT IN (
    SELECT MIN(id) FROM "Tag" WHERE "userId" = ${pgEsc(USER_ID)} GROUP BY LOWER(name)
  );

-- Normalize all remaining tag names to lowercase
UPDATE "Tag" SET name = LOWER(name) WHERE "userId" = ${pgEsc(USER_ID)};
`);

console.log('=== Step 2: Re-link events with missing tags ===');
// Get all MySQL rows with their tags
const mysqlRows = MY('SELECT id, LOWER(NULLIF(tag, "0000-00-00 00:00:00")) as tag FROM info_list WHERE tag IS NOT NULL AND tag != ""')
  .trim().split('\n');

console.log(`  MySQL rows to process: ${mysqlRows.length}`);

// Get current tag map from PG (after normalization, all lowercase)
// We'll build it from MySQL distinct tags and assume all tags now exist as lowercase in PG
const mysqlTags = new Set();
for (const row of mysqlRows) {
  const [, tag] = row.split('\t');
  if (tag && tag.trim()) mysqlTags.add(tag.trim().toLowerCase());
}

// Build EventTag inserts for events that have no tags
// Using sourceRef to match
const etValues = [];
for (const row of mysqlRows) {
  const [mlId, tag] = row.split('\t');
  if (!tag || !tag.trim()) continue;
  const tagName = tag.trim().toLowerCase();
  const sourceRef = `mylogger:info_list:${mlId.trim()}`;
  etValues.push(`(${pgEsc(sourceRef)}, ${pgEsc(tagName)})`);
}

lines.push(`
-- Insert missing EventTag rows for events with no tags
-- Match by sourceRef and tag name (case-insensitive after normalization)
INSERT INTO "EventTag" (id, "eventId", "tagId")
SELECT gen_random_uuid()::text, e.id, t.id
FROM (VALUES ${etValues.join(',\n')}) AS v(sourceref, tagname)
JOIN "Event" e ON e."sourceRef" = v.sourceref
JOIN "Tag" t ON LOWER(t.name) = v.tagname AND t."userId" = ${pgEsc(USER_ID)}
WHERE NOT EXISTS (
  SELECT 1 FROM "EventTag" et2
  WHERE et2."eventId" = e.id AND et2."tagId" = t.id
)
ON CONFLICT DO NOTHING;
`);

lines.push('COMMIT;');

// Verification
lines.push(`
SELECT 'Tags total' as metric, COUNT(*) FROM "Tag"
UNION SELECT 'Events total', COUNT(*) FROM "Event"
UNION SELECT 'EventTags total', COUNT(*) FROM "EventTag"
UNION SELECT 'Events with no tag', COUNT(*) FROM "Event" e WHERE NOT EXISTS (SELECT 1 FROM "EventTag" et WHERE et."eventId" = e.id)
UNION SELECT 'life tag count', COUNT(et.id) FROM "Tag" t JOIN "EventTag" et ON et."tagId"=t.id WHERE t.name='life'
UNION SELECT 'done tag count', COUNT(et.id) FROM "Tag" t JOIN "EventTag" et ON et."tagId"=t.id WHERE t.name='done'
ORDER BY metric;
`);

writeFileSync(SQL_FILE, lines.join('\n'));
console.log(`SQL written to ${SQL_FILE} (${etValues.length} EventTag candidates)`);

console.log('=== Copying and executing ===');
execSync(`docker cp ${SQL_FILE} personal-erp_postgres_1:/tmp/fix-tag-case.sql`, { encoding: 'utf8' });
const result = execSync(
  `docker exec personal-erp_postgres_1 psql -U personal_erp -d personal_erp -f /tmp/fix-tag-case.sql`,
  { encoding: 'utf8', timeout: 120000 }
);
console.log(result.slice(-3000));
console.log('=== Done ===');
