import { Injectable, Logger } from '@nestjs/common';

const LB_TO_KG = 0.453592;

export interface AppleHealthRecord {
  occurredAt: Date;
  value_kg: number;
}

@Injectable()
export class AppleHealthProvider {
  private readonly log = new Logger(AppleHealthProvider.name);

  /**
   * Parse Apple Health XML export and extract BodyMass records.
   * Apple Health XML format:
   *   <Record type="HKQuantityTypeIdentifierBodyMass"
   *           value="75.5" unit="kg"
   *           startDate="2023-01-15 08:30:00 +0530" ... />
   *
   * Uses regex scanning — handles files of any size without a full DOM parse.
   */
  parseWeightFromXml(xmlContent: string): AppleHealthRecord[] {
    const records: AppleHealthRecord[] = [];

    // Match every <Record .../> tag that is a BodyMass record
    const tagRe = /<Record\b[^>]*type="HKQuantityTypeIdentifierBodyMass"[^>]*\/>/gi;
    let match: RegExpExecArray | null;

    while ((match = tagRe.exec(xmlContent)) !== null) {
      const tag = match[0];

      const valueStr = this.attr(tag, 'value');
      const unit     = this.attr(tag, 'unit')?.toLowerCase() ?? 'kg';
      const dateStr  = this.attr(tag, 'startDate') ?? this.attr(tag, 'endDate');

      if (!valueStr || !dateStr) continue;

      let value = parseFloat(valueStr);
      if (isNaN(value) || value <= 0) continue;

      // Convert lbs → kg
      if (unit === 'lb' || unit === 'lbs' || unit === 'pound' || unit === 'pounds') {
        value = Math.round(value * LB_TO_KG * 10) / 10;
      }

      // Sanity check
      if (value < 20 || value > 400) continue;

      // Apple date format: "2023-01-15 08:30:00 +0530"
      // JS Date can handle "2023-01-15T08:30:00+05:30" with colon in tz offset
      const normalized = dateStr.replace(
        /(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{2})(\d{2})/,
        '$1T$2$3:$4',
      );
      const d = new Date(normalized);
      if (isNaN(d.getTime())) continue;

      records.push({ occurredAt: d, value_kg: Math.round(value * 10) / 10 });
    }

    this.log.log(`Apple Health: parsed ${records.length} weight records`);
    return records;
  }

  extractMetricValues(dp: { id: string; userId: string; occurredAt: Date; payload: any }) {
    const v = dp.payload?.value_kg;
    if (v == null) return [];
    return [{ userId: dp.userId, dataPointId: dp.id, dataType: 'weight-scale', field: 'value_kg', valueNum: v, unit: 'kg', occurredAt: dp.occurredAt }];
  }

  private attr(tag: string, name: string): string | undefined {
    const m = tag.match(new RegExp(`${name}="([^"]*)"`));
    return m ? m[1] : undefined;
  }
}
