import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'mon-pix/config/environment';

export default class EmailVerificationCode extends Component {

  @service intl;
  @tracked showResendCode = false

  constructor() {
    super(...arguments);

    setTimeout(() => {
      this.showResendCode = true;
    }, ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);
  }

  @action
  submitInputCode() {
    // todo
  }
}
