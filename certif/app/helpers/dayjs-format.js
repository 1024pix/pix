import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class DayjsFormat extends Helper {
  @service dayjs;

  compute([value, format], { inputFormat, 'allow-empty': allowEmpty } = {}) {
    if (!value) {
      return allowEmpty ? '' : value;
    }

    const parsed = this.dayjs.self(value, inputFormat);

    if (!parsed.isValid()) {
      return allowEmpty ? '' : value;
    }

    return parsed.format(format);
  }
}
