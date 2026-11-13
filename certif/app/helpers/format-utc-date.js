import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export function formatUtcDate(intl, value, { format = 'L' } = {}) {
  return intl.formatDate(value, { format, timeZone: 'UTC' });
}

export default class FormatUtcDate extends Helper {
  @service intl;

  compute([value], options) {
    return formatUtcDate(this.intl, value, options);
  }
}
