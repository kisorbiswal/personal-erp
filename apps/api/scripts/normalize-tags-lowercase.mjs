import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function norm(name) {
  return (name || '').trim().toLowerCase();
}

async function run() {
  const ws = await prisma.workspace.findFirst({ select: { id: true } });
  if (!ws) throw new Error('No workspace');

  const tags = await prisma.tag.findMany({ where: { workspaceId: ws.id }, select: { id: true, name: true } });

  const groups = new Map();
  for (const t of tags) {
    const n = norm(t.name);
    if (!n) continue;
    const arr = groups.get(n) || [];
    arr.push(t);
    groups.set(n, arr);
  }

  let merged = 0;
  let renamed = 0;
  let deleted = 0;

  for (const [n, arr] of groups.entries()) {
    // Prefer a tag that already has the normalized name to avoid unique conflicts during rename
    arr.sort((a, b) => (a.id < b.id ? -1 : 1));
    const alreadyNormalized = arr.find((t) => t.name === n);
    const canonical = alreadyNormalized ?? arr[0];

    // Merge all non-canonical tags into canonical first
    for (const t of arr) {
      if (t.id === canonical.id) continue;
      await prisma.eventTag.updateMany({ where: { tagId: t.id }, data: { tagId: canonical.id } });
      await prisma.tag.delete({ where: { id: t.id } });
      deleted++;
      merged++;
    }

    // Now rename canonical if needed (safe because duplicates removed)
    if (canonical.name !== n) {
      await prisma.tag.update({ where: { id: canonical.id }, data: { name: n } });
      renamed++;
    }
  }

  console.log({ renamed, merged, deleted, totalBefore: tags.length, totalAfter: await prisma.tag.count({ where: { workspaceId: ws.id } }) });
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
