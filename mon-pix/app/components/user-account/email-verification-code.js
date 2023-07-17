import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'mon-pix/config/environment';
import get from 'lodash/get';

export default class EmailVerificationCode extends Component {
  @service currentUser;
  @service store;
  @service intl;
  @tracked showResendCode = false;
  @tracked isResending = false;
  @tracked isEmailSent = false;
  @tracked errorMessage = null;

  constructor() {
    super(...arguments);

    setTimeout(() => {
      this.showResendCode = true;
    }, ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);
  }

  @action
  async resendVerificationCodeByEmail() {
    this.isResending = true;
    try {
      const emailVerificationCode = this.store.createRecord('email-verification-code', {
        password: this.args.password,
        newEmail: this.args.email.trim().toLowerCase(),
      });
      await emailVerificationCode.sendNewEmail();
      this.isEmailSent = true;
    } finally {
      this.isResending = false;
      setTimeout(() => {
        this.isEmailSent = false;
      }, ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);
    }
  }

  @action
  async onSubmitCode(code) {
    const emailVerificationCode = this.store.createRecord('email-verification-code', { code });
    try {
      const email = await emailVerificationCode.verifyCode();
      if (email) {
        this.currentUser.user.email = email;
      }
      this.args.disableEmailEditionMode();
      this.args.displayEmailUpdateMessage();
    } catch (response) {
      const status = get(response, 'errors[0].status');

      if (status === '403') {
        const code = get(response, 'errors[0].code');

        if (code === 'INVALID_VERIFICATION_CODE') {
          this.errorMessage = this.intl.t('pages.user-account.email-verification.errors.incorrect-code');
        } else if (code === 'EXPIRED_OR_NULL_EMAIL_MODIFICATION_DEMAND') {
          this.errorMessage = this.intl.t(
            'pages.user-account.email-verification.errors.email-modification-demand-expired',
          );
        }
      } else if (status === '400') {
        this.errorMessage = this.intl.t('pages.user-account.email-verification.errors.new-email-already-exist');
      } else {
        this.errorMessage = this.intl.t('pages.user-account.email-verification.errors.unknown-error');
      }
    }
  }
}
