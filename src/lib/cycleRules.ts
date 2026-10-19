import type { MenstrualRecord } from '@/hooks/lifeSchema';
import { addDays, fromIso } from './lifeUtils';

export type CyclePhase = '卵泡期' | '排卵期' | '黄体期' | '月经期';
export type CycleDayInfo = {
  phase: CyclePhase;
  predicted: boolean;
  recordStart?: string;
};

export const DEFAULT_CYCLE_DAYS = 28;
export const DEFAULT_PERIOD_DAYS = 5;
export const OVULATION_OFFSET_AFTER_END = 9;
export const OVULATION_DAYS = 5;

const sortedRecords = (records: MenstrualRecord[]) =>
  [...records].sort((a, b) => a.start.localeCompare(b.start));

export const daysBetween = (start: string, end: string) =>
  Math.round((fromIso(end).getTime() - fromIso(start).getTime()) / 86_400_000);

/** 两次记录使用实际间隔；三次以上取最近三个可用间隔的四舍五入平均值。 */
export function estimatedCycleDays(records: MenstrualRecord[]) {
  const starts = [...new Set(sortedRecords(records).map(item => item.start))];
  if (starts.length < 2) return DEFAULT_CYCLE_DAYS;
  const intervals = starts
    .slice(1)
    .map((start, index) => daysBetween(starts[index], start))
    .filter(value => value > 0);
  if (!intervals.length) return DEFAULT_CYCLE_DAYS;
  const recent = intervals.slice(-3);
  return Math.max(
    1,
    Math.round(recent.reduce((sum, value) => sum + value, 0) / recent.length),
  );
}

export function markPeriodStart(records: MenstrualRecord[], start: string) {
  const next = { start, end: addDays(start, DEFAULT_PERIOD_DAYS - 1) };
  const withoutSameStart = records.filter(item => item.start !== start);
  return sortedRecords([...withoutSameStart, next]);
}

export function markPeriodEnd(records: MenstrualRecord[], date: string) {
  const index = records.findIndex(
    item => date >= item.start && date <= item.end,
  );
  if (index < 0) return records;
  return sortedRecords(
    records.map((item, itemIndex) =>
      itemIndex === index ? { ...item, end: date, manualEnd: true } : item,
    ),
  );
}

/** 删除包含指定日期的整条实际经期记录；预测日期不会命中。 */
export function removePeriodRecord(
  records: MenstrualRecord[],
  date: string,
): MenstrualRecord[] {
  const index = records.findIndex(
    item => date >= item.start && date <= item.end,
  );
  if (index < 0) return records;
  return records.filter((_, itemIndex) => itemIndex !== index);
}

function phaseAfterPeriod(date: string, end: string): CycleDayInfo {
  const ovulationStart = addDays(end, OVULATION_OFFSET_AFTER_END);
  const ovulationEnd = addDays(ovulationStart, OVULATION_DAYS - 1);
  const phase =
    date < ovulationStart
      ? '卵泡期'
      : date <= ovulationEnd
        ? '排卵期'
        : '黄体期';
  return { phase, predicted: true };
}

export function cycleDayInfo(
  date: string,
  records: MenstrualRecord[],
): CycleDayInfo | null {
  const ordered = sortedRecords(records);
  if (!ordered.length || date < ordered[0].start) return null;

  const recorded = ordered.find(item => date >= item.start && date <= item.end);
  if (recorded) {
    return {
      phase: '月经期',
      predicted: false,
      recordStart: recorded.start,
    };
  }

  const previous = [...ordered].reverse().find(item => item.start < date);
  if (!previous) return null;
  const nextActual = ordered.find(item => item.start > previous.start);
  if (nextActual && date < nextActual.start)
    return phaseAfterPeriod(date, previous.end);

  const cycleDays = estimatedCycleDays(ordered);
  const firstPredictedStart = addDays(previous.start, cycleDays);
  if (date < firstPredictedStart) return phaseAfterPeriod(date, previous.end);

  const cyclesAhead = Math.floor(
    daysBetween(firstPredictedStart, date) / cycleDays,
  );
  const predictedStart = addDays(firstPredictedStart, cyclesAhead * cycleDays);
  const predictedEnd = addDays(predictedStart, DEFAULT_PERIOD_DAYS - 1);
  if (date <= predictedEnd) {
    return { phase: '月经期', predicted: true, recordStart: predictedStart };
  }
  return phaseAfterPeriod(date, predictedEnd);
}
