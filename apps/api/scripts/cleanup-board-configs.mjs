import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function normalizeColumn(c) {
  const tagsAny = (c?.query?.tagsAny || []).map((t) => String(t).trim().toLowerCase()).filter(Boolean);
  const uniqueTags = Array.from(new Set(tagsAny));
  const tagsMatch = c?.query?.tagsMatch === 'all' ? 'all' : 'any';
  const includeDone = c?.query?.includeDone === true;
  const limit = Math.min(Math.max(Number(c?.query?.limit ?? 50) || 50, 1), 200);

  const id = String(c?.id || '').trim() || `col:${Math.random().toString(36).slice(2)}`;
  const title = String(c?.title || '').trim() || (uniqueTags[0] || 'column');

  return {
    id,
    title,
    query: {
      tagsAny: uniqueTags,
      tagsMatch,
      includeDone,
      limit,
    },
    render: { type: c?.render?.type || 'list' },
  };
}

async function run() {
  const ws = await prisma.workspace.findFirst({ select: { id: true } });
  if (!ws) throw new Error('no workspace');

  const boards = await prisma.board.findMany({ where: { workspaceId: ws.id }, select: { id: true, name: true, config: true } });

  let updated = 0;

  for (const b of boards) {
    const cfg = b.config || {};

    const columns = Array.isArray(cfg.columns) && cfg.columns.length
      ? cfg.columns
      : (Array.isArray(cfg.sections) ? cfg.sections : []);

    const normCols = columns.map(normalizeColumn);

    // ensure unique column ids
    const seen = new Set();
    for (const c of normCols) {
      let id = c.id;
      while (seen.has(id)) id = `${id}-${Math.random().toString(36).slice(2, 6)}`;
      c.id = id;
      seen.add(id);
    }

    const next = {
      version: 1,
      columns: normCols,
    };

    // Only update if differs materially
    const same = JSON.stringify(next) === JSON.stringify({ version: cfg.version ?? 1, columns: cfg.columns });
    if (!same) {
      await prisma.board.update({ where: { id: b.id }, data: { config: next } });
      updated++;
      console.log(`cleaned board: ${b.name} (${b.id}) cols=${normCols.length}`);
    }
  }

  console.log({ boards: boards.length, updated });
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
