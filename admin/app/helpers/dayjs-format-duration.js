import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class DayjsFormatDuration extends Helper {
  @service dayjs;

  compute(params, hash) {
    this.dayjs.useLocale(hash.locale || this.dayjs.locale);
    this.dayjs.extend('duration');

    const durationValue = params[0];
    const durationFormat = params[1];

    return this.dayjs.self.duration(durationValue).format(durationFormat);
  }
}
