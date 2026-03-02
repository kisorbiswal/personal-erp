import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_BOARDS = [
  {
    name: 'Personal',
    tags: ['now', 'todo', 'do', 'buy', 'med', 'weight', 'mood', 'money', 'book', 'movie', 'song', 'contact', 'idea', 'quote'],
  },
  {
    name: 'Work',
    tags: ['work', 'company', 'career', 'dev', 'oracle', 'login', 'techc', 'important'],
  },
  {
    name: 'Northstar',
    tags: ['northstar', 'star', 'important', 'career', 'learn', 'pattern', 'idea'],
  },
];

function boardConfigFromTags(tags) {
  return {
    version: 1,
    sections: tags.map((t) => ({
      id: `tag:${t}`,
      title: t,
      query: { tagsAny: [t], limit: 50 },
      render: { type: 'list' },
    })),
  };
}

async function run() {
  const ws = await prisma.workspace.findFirst({ select: { id: true } });
  if (!ws) throw new Error('No workspace found');

  const existingCount = await prisma.board.count({ where: { workspaceId: ws.id } });
  if (existingCount > 0) {
    console.log(`Boards already exist (${existingCount}), skipping seed.`);
    return;
  }

  // Take existing tags and include them if present (case sensitive for now)
  const allTags = await prisma.tag.findMany({
    where: { workspaceId: ws.id },
    select: { name: true },
  });
  const tagSet = new Set(allTags.map((t) => t.name));

  for (const b of DEFAULT_BOARDS) {
    const tags = b.tags.filter((t) => tagSet.has(t));

    // Always include now/todo in Personal if present
    const config = boardConfigFromTags(tags.length ? tags : ['now'].filter((t) => tagSet.has(t)));

    await prisma.board.create({
      data: {
        workspaceId: ws.id,
        name: b.name,
        config,
      },
    });

    console.log(`Created board: ${b.name} (sections=${(config.sections || []).length})`);
  }

  // Also create an "All" board with top 25 tags by count
  const top = await prisma.tag.findMany({
    where: { workspaceId: ws.id },
    take: 25,
    orderBy: { eventTags: { _count: 'desc' } },
    include: { _count: { select: { eventTags: true } } },
  });
  const topTags = top.map((t) => t.name);
  await prisma.board.create({
    data: {
      workspaceId: ws.id,
      name: 'All',
      config: boardConfigFromTags(topTags),
    },
  });
  console.log(`Created board: All (sections=${topTags.length})`);
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
