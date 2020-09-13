import {
  fakeDate,
  restoreDate,
  getCurrentTimeShift,
  setTimeShift,
} from './FakeDate';

export const shiftTimeBy = (milliseconds: number) => {
  fakeDate();
  setTimeShift(getCurrentTimeShift() + milliseconds);
};

export const jumpToTime = (value: number | string | Date) => {
  if (typeof (value as Date).getTime === 'function') {
    value = (value as Date).getTime();
  } else if (typeof value === 'string') {
    value = new Date(value).getTime();
  }
  fakeDate();
  const jumpTo = value as number;
  const now = Date.now();
  setTimeShift(jumpTo - now + getCurrentTimeShift());
};

export const resetTime = () => {
  restoreDate();
};
