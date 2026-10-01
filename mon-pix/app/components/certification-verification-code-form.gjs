import { PixButton, PixCode, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class CertificationVerificationCodeForm extends Component {
  @service intl;

  @tracked certificateVerificationCode = null;
  @tracked errorMessage = null;
  @tracked status = 'default';

  codeRegex = /^P-[0-9A-Z]{8}$/i;

  @action
  handleVerificationCodeInput(event) {
    this.certificateVerificationCode = event.target.value;
  }

  @action
  clearErrors() {
    this.errorMessage = null;
    this.status = 'default';
    this.args.clearErrors();
  }

  get isVerificationCodeValid() {
    return this.codeRegex.test(this.certificateVerificationCode);
  }

  @action
  async checkCertificate(event) {
    event.preventDefault();
    this.clearErrors();

    if (!this.certificateVerificationCode) {
      this.errorMessage = this.intl.t('pages.fill-in-certificate-verification-code.errors.missing-code');
      this.status = 'error';
      return;
    }

    if (!this.isVerificationCodeValid) {
      this.errorMessage = this.intl.t('pages.fill-in-certificate-verification-code.errors.wrong-format');
      this.status = 'error';
      return;
    }

    this.args.checkCertificate(this.certificateVerificationCode);
  }

  <template>
    <section class="global-page-header">
      <h1 class="global-page-header__title">
        {{t "pages.fill-in-certificate-verification-code.first-title"}}
      </h1>

      <p class="global-page-header__description">
        {{t "pages.fill-in-certificate-verification-code.description"}}
      </p>
    </section>

    <form class="fill-in-certificate-verification-code__form" autocomplete="off">
      <PixCode
        @length="10"
        @requiredLabel={{t "common.form.mandatory"}}
        @subLabel={{t "pages.fill-in-certificate-verification-code.sub-label"}}
        @value={{this.certificateVerificationCode}}
        @validationStatus={{this.status}}
        @errorMessage={{this.errorMessage}}
        {{on "keyup" this.clearErrors}}
        {{on "input" this.handleVerificationCodeInput}}
      >
        <:label>{{t "pages.fill-in-certificate-verification-code.label"}}</:label>
      </PixCode>

      <PixButton @type="submit" @triggerAction={{this.checkCertificate}}>
        {{t "pages.fill-in-certificate-verification-code.verify"}}
      </PixButton>

      {{#if @apiErrorMessage}}
        <PixNotificationAlert @type="error" @withIcon={{true}}>
          {{@apiErrorMessage}}
        </PixNotificationAlert>
      {{/if}}
    </form>
  </template>
}
