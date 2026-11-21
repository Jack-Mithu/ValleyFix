import { addDays, dayOfWeek, fromMinutes, toMinutes, ukDate, ukToUtc } from './uk-time.js';

describe('UK time helpers', () => {
  it('winter (GMT): 09:00 UK is 09:00 UTC', () => {
    expect(ukToUtc('2026-12-01', '09:00').toISOString()).toBe('2026-12-01T09:00:00.000Z');
  });

  it('summer (BST): 09:00 UK is 08:00 UTC', () => {
    expect(ukToUtc('2026-07-01', '09:00').toISOString()).toBe('2026-07-01T08:00:00.000Z');
  });

  it('handles the spring clock change (29 Mar 2026)', () => {
    expect(ukToUtc('2026-03-28', '10:00').toISOString()).toBe('2026-03-28T10:00:00.000Z');
    expect(ukToUtc('2026-03-29', '10:00').toISOString()).toBe('2026-03-29T09:00:00.000Z');
  });

  it('gives the UK date of an instant, even late at night in summer', () => {
    // 23:30 UTC on 1 July is already 00:30 on 2 July in the UK.
    expect(ukDate(new Date('2026-07-01T23:30:00Z'))).toBe('2026-07-02');
  });

  it('works out weekdays and date arithmetic', () => {
    expect(dayOfWeek('2026-11-23')).toBe(1); // Monday
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(toMinutes('09:30')).toBe(570);
    expect(fromMinutes(570)).toBe('09:30');
  });
});
