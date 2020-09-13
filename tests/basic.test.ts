import { jumpToTime, shiftTimeBy, resetTime } from '../src';
import 'mocha';
import { expect, assert } from 'chai';
import { FakeDate } from '../src/FakeDate';

const OriginalDate = Date;
const SECOND = 1000;
const HOUR = 60 * 60 * SECOND;

const assertEqualsOrABitMore = (a: number, b: number) => {
  assert.isAtLeast(a, b);
  assert.isBelow(a - b, 10);
};
const sleep = async (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('Basic tests', () => {
  let testStartRealTime = OriginalDate.now();
  let testStartHrTime = process.hrtime();
  let testStartHrTimeBigInt = process.hrtime.bigint();

  beforeEach(() => {
    resetTime();
    assert.strictEqual(Date, OriginalDate);
    testStartRealTime = OriginalDate.now();
    testStartHrTime = process.hrtime();
    testStartHrTimeBigInt = process.hrtime.bigint();
  });

  it('mocks shiftTimeBy', () => {
    shiftTimeBy(HOUR);

    assert.notStrictEqual(Date, OriginalDate);
  });

  it('mocks jumpToTime', () => {
    jumpToTime(HOUR);

    assert.notStrictEqual(Date, OriginalDate);
  });

  it('full date constructors are equal', () => {
    const date1 = new Date(2020, 2, 2, 2);
    jumpToTime(HOUR);
    const date2 = new Date(2020, 2, 2, 2);

    assertEqualsOrABitMore(date1.getTime(), date2.getTime());
  });

  it('works with window object', () => {
    global.window = {} as any;
    global.window.Date = Date;
    shiftTimeBy(HOUR);

    assert.strictEqual(global.window.Date, FakeDate);

    resetTime();

    assert.strictEqual(global.window.Date, OriginalDate);

    resetTime();

    assert.strictEqual(global.window.Date, OriginalDate);
    global.window = undefined as any;
  });

  it('instances are original date', () => {
    shiftTimeBy(HOUR);

    expect(new Date() instanceof OriginalDate).to.equal(true);
  });

  it('Date.now() and new Date() give the same result when the time is shifted forwards', () => {
    shiftTimeBy(HOUR);

    const now = Date.now();
    const now2 = new Date().getTime();

    assertEqualsOrABitMore(now, now2);
  });

  it('Date.now() and new Date() give the same result when the time is shifted backwards', () => {
    shiftTimeBy(-HOUR);

    const now = Date.now();
    const now2 = new Date().getTime();

    assertEqualsOrABitMore(now, now2);
  });

  it('Shifts time forward', () => {
    shiftTimeBy(HOUR);

    const now = Date.now();

    assertEqualsOrABitMore(now - testStartRealTime, HOUR);
  });

  it('Shifts time backward', () => {
    shiftTimeBy(-HOUR);

    const now = Date.now();

    assertEqualsOrABitMore(now - testStartRealTime, -HOUR);
  });

  it('time is still ticking after shifting', async () => {
    shiftTimeBy(HOUR);

    await sleep(200);
    assertEqualsOrABitMore(Date.now() - testStartRealTime, HOUR + 200);

    await sleep(100);
    assertEqualsOrABitMore(Date.now() - testStartRealTime, HOUR + 300);
  });

  it('multiple shifts test', () => {
    shiftTimeBy(HOUR);
    shiftTimeBy(-HOUR * 2);

    assertEqualsOrABitMore(Date.now() - testStartRealTime, -HOUR);

    shiftTimeBy(HOUR);
    assertEqualsOrABitMore(Date.now() - testStartRealTime, 0);
  });

  it('jumps to a date', () => {
    jumpToTime(testStartRealTime + HOUR);

    assertEqualsOrABitMore(Date.now() - testStartRealTime, HOUR);
  });

  it('jumps to a date after a shift', () => {
    shiftTimeBy(-HOUR);
    jumpToTime(testStartRealTime + HOUR);

    assertEqualsOrABitMore(Date.now() - testStartRealTime, HOUR);
  });

  it('combined jump and shift', () => {
    shiftTimeBy(-HOUR);
    jumpToTime(testStartRealTime + HOUR);
    shiftTimeBy(HOUR);

    assertEqualsOrABitMore(Date.now() - testStartRealTime, HOUR * 2);
  });

  it('jumps to a string date', () => {
    const originalDate = new Date(testStartRealTime).toISOString();
    shiftTimeBy(-HOUR);
    jumpToTime(originalDate);

    assertEqualsOrABitMore(Date.now() - testStartRealTime, 0);
  });

  it('jumps to the exact string date without the time shift', () => {
    shiftTimeBy(HOUR * 100500);
    jumpToTime('2020-02-02T00:00:00.000Z');

    assertEqualsOrABitMore(Date.now(), 1580601600000);
  });

  it('jumps to the exact number date without the time shift', () => {
    shiftTimeBy(HOUR * 100500);
    jumpToTime(1580601600000);

    assert.equal(new Date().toISOString().indexOf('2020-02-02T00:00:00.'), 0);
  });

  it('jumps to the exact Date date without the time shift', () => {
    shiftTimeBy(HOUR * 100500);
    jumpToTime(new Date(1580601600000));

    assert.equal(new Date().toISOString().indexOf('2020-02-02T00:00:00.'), 0);
  });

  it('shifting time does not affect previously created dates', () => {
    const date = new Date();
    shiftTimeBy(HOUR);
    const mockedDate = new Date();
    jumpToTime(new Date(testStartRealTime));
    shiftTimeBy(HOUR);

    assertEqualsOrABitMore(Date.now() - testStartRealTime, HOUR);
    assertEqualsOrABitMore(date.getTime() - testStartRealTime, 0);
    assertEqualsOrABitMore(mockedDate.getTime() - testStartRealTime, HOUR);
  });

  it('Date.UTC() is not affected', () => {
    shiftTimeBy(HOUR * 100500);

    assert.equal(Date.UTC(2020, 12), OriginalDate.UTC(2020, 12));
  });

  it('Date.parse() is not affected', () => {
    shiftTimeBy(HOUR * 100500);

    assert.equal(
      Date.parse('Sat, 12 Sep 2020 17:09:02 GMT'),
      OriginalDate.parse('Sat, 12 Sep 2020 17:09:02 GMT')
    );
  });

  it('nodejs hrtime not affected initially', () => {
    assertEqualsOrABitMore(process.hrtime()[0] - testStartHrTime[0], 0);
  });

  it('nodejs hrtime.bigint not affected initially', () => {
    assertEqualsOrABitMore(
      new Number(
        (process.hrtime.bigint() - testStartHrTimeBigInt) / BigInt(1000000)
      ).valueOf(),
      0
    );
  });

  it('nodejs hrtime()', () => {
    shiftTimeBy(HOUR);

    let hrtime = process.hrtime();
    let hrtimeDiff = process.hrtime(testStartHrTime);

    assertEqualsOrABitMore(hrtime[0] - testStartHrTime[0], HOUR / 1000);
    // Should be a safe integer until some far year.
    assertEqualsOrABitMore(
      (hrtime[0] * 1000000000 +
        hrtime[1] -
        (testStartHrTime[0] * 1000000000 + testStartHrTime[1])) /
        1000000, // ns -> ms
      HOUR
    );
    assertEqualsOrABitMore(
      (hrtimeDiff[0] * 1000000000 + hrtimeDiff[1]) / 1000000, // ns -> ms
      HOUR
    );
  });

  it('nodejs hrtime.bigint()', () => {
    shiftTimeBy(HOUR);

    assertEqualsOrABitMore(
      new Number(
        (process.hrtime.bigint() - testStartHrTimeBigInt) / BigInt(1000000)
      ).valueOf(),
      HOUR
    );
  });

  it('nodejs hrtime() should correctly add milliseconds', async () => {
    shiftTimeBy(HOUR + 999);

    await sleep(1);
    const hrtime = process.hrtime();

    assertEqualsOrABitMore(
      new Number(
        (BigInt(hrtime[0] * 1000000000 + hrtime[1]) - testStartHrTimeBigInt) /
          BigInt(1000000) -
          BigInt(HOUR + 1000)
      ).valueOf(),
      0
    );
  });
});
