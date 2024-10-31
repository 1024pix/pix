import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';

import isEmailValid from '../../../utils/email-validator.js';
import PasswordResetDemandReceivedInfo from './password-reset-demand-received-info';

export default class PasswordResetDemandForm extends Component {
  @service intl;

  @tracked isLoading = false;
  @tracked errorMessage;
  @tracked emailInputPlaceholder = this.intl.t(
    'components.authentication.password-reset-demand-form.fields.email.placeholder',
  );
  @tracked emailInputvalidationStatus;
  @tracked emailInputvalidationErrorMessage;
  @tracked isPasswordResetDemandReceived = false;

  email;

  @action
  handleEmailChange(event) {
    this.email = event.target.value;
    this.emailInputvalidationStatus = isEmailValid(this.email) ? 'success' : 'error';
    this.emailInputvalidationErrorMessage = this.intl.t(
      'components.authentication.password-reset-demand-form.fields.email.error-message-invalid',
    );
  }

  @action
  async handlePasswordResetDemand(event) {
    if (event) event.preventDefault();

    this.errorMessage = null;

    const email = this.email.trim();
    if (!email || this.emailInputvalidationStatus === 'error') {
      return;
    }

    try {
      this.isLoading = true;
      const response = await window.fetch(`${ENV.APP.API_HOST}/api/password-reset-demands`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (!response.ok && response.status != 404) {
        throw new Error(`Response status: ${response.status}`);
      }

      this.isPasswordResetDemandReceived = true;
    } catch (error) {
      this.errorMessage = this.intl.t('common.api-error-messages.internal-server-error');
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    {{#if this.isPasswordResetDemandReceived}}
      <PasswordResetDemandReceivedInfo />
    {{else}}
      <form {{on "submit" this.handlePasswordResetDemand}} class="authentication-password-reset-demand-form">
        <p class="authentication-password-reset-demand-form__rule">
          {{t "components.authentication.password-reset-demand-form.rule"}}
        </p>

        {{#if this.errorMessage}}
          <PixMessage
            @type="error"
            @withIcon={{true}}
            class="authentication-password-reset-demand-form__error"
            role="alert"
          >
            {{this.errorMessage}}
          </PixMessage>
        {{/if}}
        <div class="authentication-password-reset-demand-form__input-block">
          <PixInput
            @value={{this.email}}
            type="email"
            {{on "change" this.handleEmailChange}}
            @validationStatus={{this.emailInputvalidationStatus}}
            @errorMessage={{this.emailInputvalidationErrorMessage}}
            placeholder={{this.emailInputPlaceholder}}
            required={{true}}
          >
            <:label>{{t "components.authentication.password-reset-demand-form.fields.email.label"}}</:label>
          </PixInput>
        </div>
        <div>
          <PixButton
            @type="submit"
            @isLoading={{this.isLoading}}
            class="authentication-password-reset-demand-form__button"
          >
            {{t "components.authentication.password-reset-demand-form.actions.receive-reset-button"}}
          </PixButton>
        </div>
        <p class="authentication-password-reset-demand-form__help">
          {{t "components.authentication.password-reset-demand-form.no-email-question"}}
          <PixButtonLink
            @variant="tertiary"
            @href="{{t 'components.authentication.password-reset-demand-form.contact-us-link.link-url'}}"
            target="_blank"
            class="authentication-password-reset-demand-form__help-contact-us-link"
          >
            {{t "components.authentication.password-reset-demand-form.contact-us-link.link-text"}}
          </PixButtonLink>
        </p>
      </form>
    {{/if}}
  </template>
}
