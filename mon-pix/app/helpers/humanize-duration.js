import Helper from '@ember/component/helper';
import { service } from '@ember/service';

const SECONDS_BY_UNIT = [
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

// A duration is expressed in a unit as soon as it reaches 3/4 of it (e.g. 45 minutes becomes 1 hour)
const UNIT_THRESHOLD = 0.75;

export function humanizeDuration(durationInSeconds, locale) {
  const seconds = Math.abs(Number(durationInSeconds) || 0);
  const [unit, unitInSeconds] = SECONDS_BY_UNIT.find(
    ([, unitInSeconds]) => seconds >= unitInSeconds * UNIT_THRESHOLD,
  ) ?? ['second', 1];
  const value = Math.max(1, Math.round(seconds / unitInSeconds));

  return new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'long' }).format(value);
}

export default class HumanizeDuration extends Helper {
  @service intl;

  compute([durationInSeconds]) {
    return humanizeDuration(durationInSeconds, this.intl.primaryLocale);
  }
}
