import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const template = {
  id: 'fitbit-sleep-weight-v1',
  name: 'Sleep & Weight Correlation',
  description: 'Correlates nightly sleep duration with morning weight over time',
  author: 'system',
  version: '1.0.0',
  isBuiltIn: true,
  definition: {
    id: 'fitbit-sleep-weight-v1',
    name: 'Sleep & Weight Correlation',
    description: 'Correlates nightly sleep duration with morning weight over time',
    author: 'system',
    version: '1.0.0',
    requires: [
      {
        slot: 'sleep',
        dataType: 'sleep-tracker',
        fields: ['duration_min', 'start_time', 'end_time'],
        aggregation: 'daily',
        optional: false,
      },
      {
        slot: 'weight',
        dataType: 'weight-scale',
        fields: ['value_kg'],
        aggregation: 'daily_latest',
        optional: true,
      },
    ],
    charts: [
      {
        id: 'main-timeline',
        type: 'dual-axis-line',
        title: 'Sleep Duration vs Weight',
        xAxis: { field: 'date', label: 'Date' },
        series: [
          {
            slot: 'sleep',
            field: 'duration_min',
            label: 'Sleep (hours)',
            transform: 'div60',
            axis: 'left',
            color: '#6366f1',
            unit: 'h',
          },
          {
            slot: 'weight',
            field: 'value_kg',
            label: 'Weight (kg)',
            axis: 'right',
            color: '#f59e0b',
            unit: 'kg',
          },
        ],
      },
    ],
  },
};

async function main() {
  console.log('Seeding health report template...');

  await prisma.reportTemplate.upsert({
    where: { id: template.id },
    create: template,
    update: {
      name: template.name,
      description: template.description,
      definition: template.definition,
      version: template.version,
    },
  });

  console.log(`Upserted template: ${template.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
