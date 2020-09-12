const OriginalDate = Date;
const originalProcessHrTime = process?.hrtime;
const originalProcessHrTimeBigInt = process?.hrtime?.bigint;

let globalTimeShift = 0;

export const fakeDate = () => {
  if (FakeDate === Date) {
    return;
  }
  if (global.window) {
    global.window.Date = FakeDate as any;
  } else {
    global.Date = FakeDate as any;
    process.hrtime = patchedProcessHrTime as any;
  }
};

export const restoreDate = () => {
  if (OriginalDate === Date) {
    return;
  }
  if (global.window) {
    global.window.Date = OriginalDate;
  } else {
    global.Date = OriginalDate;
    process.hrtime = originalProcessHrTime;
  }
  globalTimeShift = 0;
};

function patchedProcessHrTime(...args: any[]): NodeJS.HRTime {
  const result = originalProcessHrTime.call(process, ...args) as any;
  result[0] += Math.round(globalTimeShift / 1000);
  result[1] += (globalTimeShift % 1000) * 1000000; // ms -> ns
  if (result[1] >= 1000000000) {
    // if nanoseconds > 1s
    result[0] += 1;
    result[1] %= 1000000000;
  }
  return result;
}
patchedProcessHrTime.bigint = function () {
  const result = originalProcessHrTimeBigInt.call(process) as bigint;
  return (
    result +
    (((BigInt(Math.round(globalTimeShift)) *
      BigInt(1000000)) as unknown) as bigint) // ms -> ns
  );
};

export const setTimeShift = (shift: number) => (globalTimeShift = shift);
export const getCurrentTimeShift = () => globalTimeShift;

export class FakeDate extends Date {
  static now() {
    return OriginalDate.now() + globalTimeShift;
  }

  constructor();
  constructor(value: number | string);
  constructor(
    year: number,
    month: number,
    date?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    ms?: number
  );
  constructor(
    y?: number | string,
    m?: number,
    d?: number,
    h?: number,
    M?: number,
    s?: number,
    ms?: number
  ) {
    super();
    switch (arguments.length) {
      case 0:
        return new OriginalDate(OriginalDate.now() + globalTimeShift);
      case 1:
        return new OriginalDate(y!);
      default:
        return new OriginalDate(y as number, m as number, d, h, M, s, ms);
    }
  }
}
