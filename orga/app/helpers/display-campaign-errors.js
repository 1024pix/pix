import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class extends Helper {
  @service errorMessages;

  compute([errors]) {
    if (!errors.length) return;
    return this.errorMessages.getErrorMessage(errors[0].message);
  }
}
