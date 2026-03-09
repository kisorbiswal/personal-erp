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
        aggregation: 'weekly_avg',
        optional: false,
      },
      {
        slot: 'weight',
        dataType: 'weight-scale',
        fields: ['value_kg'],
        aggregation: 'weekly_avg',
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

const weightTimelineTemplate = {
  id: 'weight-timeline-v1',
  name: 'Weight Timeline (MyLogger + Fitbit)',
  description: 'Your full weight history from 2014 to today — MyLogger boards data combined with Fitbit. See long-term trends across both sources.',
  version: '1.0.0',
  author: 'system',
  definition: {
    id: 'weight-timeline-v1',
    name: 'Weight Timeline (MyLogger + Fitbit)',
    author: 'system',
    version: '1.0.0',
    description: 'Full weight history combining MyLogger board entries (2014–2021) and Fitbit (2024–2025)',
    charts: [
      {
        id: 'weight-combined-timeline',
        type: 'multi-line',
        title: 'Weight History — All Sources',
        series: [
          { slot: 'mylogger_weight', label: 'MyLogger (kg)', color: '#6366f1', type: 'line' },
          { slot: 'fitbit_weight',   label: 'Fitbit (kg)',   color: '#f59e0b', type: 'line' },
        ],
      },
    ],
    requires: [
      {
        slot: 'mylogger_weight',
        dataType: 'weight-scale',
        provider: 'mylogger',
        fields: ['value_kg'],
        aggregation: 'weekly_avg',
        optional: true,
      },
      {
        slot: 'fitbit_weight',
        dataType: 'weight-scale',
        provider: 'fitbit',
        fields: ['value_kg'],
        aggregation: 'weekly_avg',
        optional: true,
      },
    ],
  },
};

async function main() {
  console.log('Seeding health report templates...');

  for (const tmpl of [template, weightTimelineTemplate]) {
    await prisma.reportTemplate.upsert({
      where: { id: tmpl.id },
      create: tmpl,
      update: { name: tmpl.name, description: tmpl.description, definition: tmpl.definition, version: tmpl.version },
    });
    console.log(`Upserted template: ${tmpl.id}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
