import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'mon-pix/config/environment';

export default class EmailVerificationCode extends Component {
  @service currentUser;
  @service store;
  @service intl;
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
  async onSubmitCode(code) {
    const emailVerificationCode = this.store.createRecord('email-verification-code', { code });
    const email = await emailVerificationCode.verifyCode();
    if (email) {
      this.currentUser.user.email = email;
    }
    this.args.disableEmailEditionMode();
    this.args.displayEmailUpdateMessage();
  }
}
