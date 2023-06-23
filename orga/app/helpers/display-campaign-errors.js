import Helper from '@ember/component/helper';
import { service } from '@ember/service';

export default class extends Helper {
  @service errorMessages;

  compute([errors]) {
    if (!errors.length) return null;
    return this.errorMessages.getErrorMessage(errors[0].message);
  }
}
