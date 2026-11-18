import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class DayjsDurationHumanize extends Helper {
  @service dayjs;

  compute([value, unit]) {
    return this.dayjs.humanizeDuration(value, unit);
  }
}
