import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInputCode from '@1024pix/pix-ui/components/pix-input-code';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';

export default class EmailVerificationCode extends Component {
  numInputs = 6;

  @service currentUser;
  @service store;
  @service intl;
  @tracked showResendCode = false;
  @tracked isResending = false;
  @tracked isEmailSent = false;
  @tracked errorMessage = null;
  @tracked code = null;

  constructor() {
    super(...arguments);

    setTimeout(() => {
      this.showResendCode = true;
    }, ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);
  }

  @action
  setCode(code) {
    this.code = code;
  }

  @action
  async resendVerificationCodeByEmail() {
    this.isResending = true;
    try {
      const emailVerificationCode = this.store.createRecord('email-verification-code', {
        password: this.args.password,
        newEmail: this.args.email.trim().toLowerCase(),
        action: this.args.action,
      });
      await emailVerificationCode.sendNewEmail();
      this.isEmailSent = true;
      this.code = null;
    } finally {
      this.isResending = false;
      setTimeout(() => {
        this.isEmailSent = false;
      }, ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);
    }
  }

  @action
  async onSubmitCode() {
    if (this.code?.length !== this.numInputs) {
      this.errorMessage = this.intl.t('pages.user-account.email-verification.errors.no-code', {
        numInputs: this.numInputs,
      });
      return;
    }
    const code = this.code;
    this.code = null;
    const emailVerificationCode = this.store.createRecord('email-verification-code', {
      code,
      action: this.args.action,
    });
    try {
      const email = await emailVerificationCode.verifyCode();
      if (this.args.action === 'add-email') {
        await this._reloadAccountData();
        this.args.displayEmailAddedMessage();
      } else {
        if (email) {
          this.currentUser.user.email = email;
        }
        this.args.displayEmailUpdateMessage();
      }
      this.args.disableEmailEditionMode();
    } catch (response) {
      const status = get(response, 'errors[0].status');
      const code = get(response, 'errors[0].code');
      if (status === '403') {
        if (code === 'INVALID_VERIFICATION_CODE') {
          this.errorMessage = this.intl.t('pages.user-account.email-verification.errors.incorrect-code');
        } else if (code === 'EXPIRED_OR_NULL_EMAIL_MODIFICATION_DEMAND') {
          this.errorMessage = this.intl.t(
            'pages.user-account.email-verification.errors.email-modification-demand-expired',
          );
        }
      } else if (status === '422') {
        if (code === 'INVALID_OR_ALREADY_USED_EMAIL') {
          this.errorMessage = this.intl.t('pages.user-account.email-verification.errors.new-email-already-exist');
        }
      } else {
        this.errorMessage = this.intl.t('pages.user-account.email-verification.errors.unknown-error');
      }
    }
  }

  async _reloadAccountData() {
    await this.currentUser.load();
    await this.currentUser.user.belongsTo('accountInfo').reload();
    await this.store.findAll('authentication-method', { reload: true });
  }

  <template>
    <div class="email-verification-code">
      <h2 class="email-verification-code__title">{{t "pages.user-account.email-verification.title"}}</h2>

      <p class="email-verification-code__description">{{t "pages.user-account.email-verification.description"}}</p>
      <p class="email-verification-code__email">{{@email}}</p>
      <p class="email-verification-code__time-code-validation">{{t
          "pages.user-account.email-verification.time-code-validation"
        }}</p>
      <div class="email-verification-code__input-code">
        <PixInputCode
          @ariaLabel={{t "pages.user-account.email-verification.code-label"}}
          @legend={{t "pages.user-account.email-verification.code-legend"}}
          @explanationOfUse={{t "pages.user-account.email-verification.code-explanation-of-use"}}
          @numInputs={{this.numInputs}}
          @onAllInputsFilled={{this.setCode}}
        />
      </div>

      {{#if this.errorMessage}}
        <PixNotificationAlert @type="error" class="email-verification-code__error">
          {{this.errorMessage}}
        </PixNotificationAlert>
      {{/if}}

      {{#if this.isEmailSent}}
        <PixNotificationAlert @type="success" class="email-verification-code__resend-confirmation-message">
          {{t "pages.user-account.email-verification.confirmation-message"}}
        </PixNotificationAlert>
      {{else}}
        <div class="email-verification-code__resend {{if this.showResendCode 'visible'}}">
          <p>{{t "pages.user-account.email-verification.did-not-receive"}}</p>
          <button type="button" disabled={{this.isResending}} {{on "click" this.resendVerificationCodeByEmail}}>
            {{t "pages.user-account.email-verification.send-back-the-code"}}
          </button>
        </div>
      {{/if}}
      <div class="email-verification-code__actions">
        <PixButton @triggerAction={{@disableEmailEditionMode}} @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @triggerAction={{this.onSubmitCode}} @variant="primary">
          {{t "pages.user-account.email-verification.validate-new-email"}}
        </PixButton>
      </div>
    </div>
  </template>
}
