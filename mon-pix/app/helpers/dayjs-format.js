import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class DayjsFormat extends Helper {
  @service dayjs;

  compute([date, outputFormat]) {
    return this.dayjs.format(date, outputFormat);
  }
}
