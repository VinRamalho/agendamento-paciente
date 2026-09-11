import {
  addMinutes,
  buildDateTimeInAppTimezone,
  formatDateInAppTimezone,
  formatTimeInAppTimezone,
} from './datetime.util';

describe('datetime.util', () => {
  it('should build datetime in America/Sao_Paulo', () => {
    const date = buildDateTimeInAppTimezone('2026-09-15', '14:00');
    expect(formatDateInAppTimezone(date)).toBe('2026-09-15');
    expect(formatTimeInAppTimezone(date)).toBe('14:00');
  });

  it('should add minutes correctly', () => {
    const start = buildDateTimeInAppTimezone('2026-09-15', '14:00');
    const end = addMinutes(start, 90);
    expect(formatTimeInAppTimezone(end)).toBe('15:30');
  });
});
