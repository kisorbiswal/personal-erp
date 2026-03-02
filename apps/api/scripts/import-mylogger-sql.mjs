import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SQL_PATH = process.env.MYLOGGER_SQL_PATH || '/home/butu/mylogger20240802.sql';
const MYLOGGER_USER = process.env.MYLOGGER_USER || '117245190';

// Parse a MySQL INSERT INTO `info_list` VALUES (...) statement.
function parseValuesBlob(blob) {
  const rows = [];
  let i = 0;
  while (i < blob.length) {
    while (i < blob.length && /\s/.test(blob[i])) i++;
    if (i >= blob.length) break;
    if (blob[i] !== '(') {
      i++;
      continue;
    }
    i++; // skip (

    const fields = [];
    let field = '';
    let inStr = false;
    let escape = false;

    while (i < blob.length) {
      const c = blob[i];
      if (inStr) {
        if (escape) {
          field += c;
          escape = false;
        } else if (c === '\\') {
          escape = true;
        } else if (c === "'") {
          inStr = false;
        } else {
          field += c;
        }
        i++;
        continue;
      }

      if (c === "'") {
        inStr = true;
        i++;
        continue;
      }

      if (c === ',') {
        fields.push(field.trim());
        field = '';
        i++;
        continue;
      }

      if (c === ')') {
        fields.push(field.trim());
        i++;
        break;
      }

      field += c;
      i++;
    }

    rows.push(fields);

    while (i < blob.length && /\s/.test(blob[i])) i++;
    if (i < blob.length && blob[i] === ',') i++;
  }

  return rows;
}

function norm(v) {
  const s = String(v ?? '').trim();
  if (!s || s.toUpperCase() === 'NULL') return null;
  return s;
}

function parseMysqlTimestamp(ts) {
  if (!ts) return null;
  // Expect: YYYY-MM-DD HH:MM:SS
  const m = ts.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/);
  if (!m) return null;
  // Treat as UTC for now (your dump had TIME_ZONE='+00:00')
  return new Date(`${m[1]}T${m[2]}Z`);
}

async function ensureSeed() {
  const email = process.env.SEED_EMAIL || 'butu@local';
  const workspaceName = process.env.SEED_WORKSPACE || 'butu';

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'butu' }
  });

  const workspace = await prisma.workspace.findFirst({ where: { name: workspaceName } });
  const ws = workspace ?? await prisma.workspace.create({ data: { name: workspaceName } });

  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: ws.id, userId: user.id } },
    update: { role: 'OWNER' },
    create: { workspaceId: ws.id, userId: user.id, role: 'OWNER' }
  });

  return { user, workspace: ws };
}

async function run() {
  console.log(`Importing from ${SQL_PATH} for mylogger user=${MYLOGGER_USER}`);

  const { user, workspace } = await ensureSeed();

  const insertRe = /^INSERT INTO `info_list` VALUES (.+);$/;

  const stream = fs.createReadStream(SQL_PATH, { encoding: 'utf-8' });
  let buf = '';

  let total = 0;
  let imported = 0;

  const tagCache = new Map(); // tagName -> tagId

  async function getTagId(tagName) {
    if (tagCache.has(tagName)) return tagCache.get(tagName);
    const tag = await prisma.tag.upsert({
      where: { workspaceId_name: { workspaceId: workspace.id, name: tagName } },
      update: {},
      create: { workspaceId: workspace.id, name: tagName }
    });
    tagCache.set(tagName, tag.id);
    return tag.id;
  }

  async function handleLine(line) {
    const m = insertRe.exec(line);
    if (!m) return;

    const rows = parseValuesBlob(m[1]);
    for (const fields of rows) {
      // columns: id, info, tag, added_date, completed_date, user, isprivate, complete_by, start_by
      if (fields.length < 6) continue;

      const id = norm(fields[0]);
      const info = norm(fields[1]) ?? '';
      const tag = norm(fields[2]) ?? 'untagged';
      const added = norm(fields[3]);
      const u = norm(fields[5]);

      if (u !== MYLOGGER_USER) continue;
      total++;

      const occurredAt = parseMysqlTimestamp(added) ?? new Date();
      const sourceRef = `mylogger:info_list:${id}`;

      // Create event
      const event = await prisma.event.create({
        data: {
          workspaceId: workspace.id,
          createdById: user.id,
          occurredAt,
          content: info,
          visibility: 'PRIVATE',
          source: 'mylogger',
          sourceRef
        }
      });

      // Link tag
      const tagId = await getTagId(tag);
      await prisma.eventTag.create({
        data: { eventId: event.id, tagId }
      });

      imported++;
      if (imported % 1000 === 0) {
        console.log(`Imported ${imported} events...`);
      }
    }
  }

  for await (const chunk of stream) {
    buf += chunk;
    let idx;
    while ((idx = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, idx).trimEnd();
      buf = buf.slice(idx + 1);
      if (line) await handleLine(line);
    }
  }
  if (buf.trim()) await handleLine(buf.trim());

  console.log(`Done. matched=${total} imported=${imported}`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
