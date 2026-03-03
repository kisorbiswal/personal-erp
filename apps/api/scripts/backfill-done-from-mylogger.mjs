import fs from 'node:fs';
import process from 'node:process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SQL_PATH = process.env.MYLOGGER_SQL_PATH || '/home/butu/mylogger20240802.sql';
const MYLOGGER_USER = process.env.MYLOGGER_USER || '117245190';
const DONE_TAG = process.env.DONE_TAG || 'done';

const insertRe = /^INSERT INTO `info_list` VALUES (.+);$/;

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
    i++;

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

async function run() {
  const ws = await prisma.workspace.findFirst({ select: { id: true } });
  if (!ws) throw new Error('No workspace');

  // ensure done tag exists
  const doneTag = await prisma.tag.upsert({
    where: { workspaceId_name: { workspaceId: ws.id, name: DONE_TAG } },
    update: {},
    create: { workspaceId: ws.id, name: DONE_TAG },
  });

  console.log(`Backfilling done from ${SQL_PATH} user=${MYLOGGER_USER} tag=${DONE_TAG}`);

  const stream = fs.createReadStream(SQL_PATH, { encoding: 'utf-8' });
  let buf = '';

  let matched = 0;
  let updated = 0;
  let already = 0;
  let missing = 0;

  async function handleLine(line) {
    const m = insertRe.exec(line);
    if (!m) return;

    const rows = parseValuesBlob(m[1]);
    for (const fields of rows) {
      // columns: id, info, tag, added_date, completed_date, user, ...
      if (fields.length < 6) continue;
      const id = norm(fields[0]);
      const completed = norm(fields[4]);
      const u = norm(fields[5]);
      if (u !== MYLOGGER_USER) continue;
      if (!completed) continue;

      matched++;
      const sourceRef = `mylogger:info_list:${id}`;

      const ev = await prisma.event.findFirst({
        where: { workspaceId: ws.id, source: 'mylogger', sourceRef },
        select: { id: true },
      });

      if (!ev) {
        missing++;
        continue;
      }

      // link done tag if not present
      const existing = await prisma.eventTag.findFirst({
        where: { eventId: ev.id, tagId: doneTag.id },
        select: { id: true },
      });
      if (existing) {
        already++;
        continue;
      }

      await prisma.eventTag.create({ data: { eventId: ev.id, tagId: doneTag.id } });
      updated++;

      if (updated % 500 === 0) console.log(`done tagged: ${updated}`);
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

  console.log({ matched, updated, already, missing });
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
