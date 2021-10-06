import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'mon-pix/config/environment';

export default class EmailVerificationCode extends Component {

  @service intl;
  @service store;
  @tracked showResendCode = false;
  @tracked wasButtonClicked = false;

  constructor() {
    super(...arguments);

    setTimeout(() => {
      this.showResendCode = true;
    }, ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);
  }

  @action
  async resendVerificationCodeByEmail() {
    try {
      if (!this.wasButtonClicked) {
        this.wasButtonClicked = true;
        const emailVerificationCode = this.store.createRecord('email-verification-code', {
          password: this.args.password,
          newEmail: this.args.email.trim().toLowerCase(),
        });
        await emailVerificationCode.sendNewEmail();
      }
    } finally {
      setTimeout(() => {
        this.wasButtonClicked = false;
      }, ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);
    }
  }

  @action
  submitInputCode() {
    // todo
  }
}
