import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';
import didInsert from 'mon-pix/modifiers/modifier-did-insert';
import { FormValidation } from 'mon-pix/utils/form-validation';
import isPasswordValid, { PASSWORD_RULES } from 'mon-pix/utils/password-validator.js';

import NewPasswordInput from './new-password-input';

const HTTP_ERROR_MESSAGES = {
  400: 'common.validation.password.error',
  403: 'components.authentication.password-reset-form.errors.forbidden',
  404: 'components.authentication.password-reset-form.errors.expired-demand',
  REVOKED_PASSWORD_CANNOT_BE_REUSED:
    'components.authentication.password-reset-form.errors.revoked-password-cannot-be-reused',
  default: 'common.api-error-messages.internal-server-error',
};

export default class PasswordResetForm extends Component {
  @service intl;

  @tracked isPasswordResetSucceeded = false;
  @tracked isLoading = false;
  @tracked globalError;

  validation = new FormValidation({
    password: {
      validate: (value) => isPasswordValid(value),
      error: 'common.validation.password.error',
    },
  });

  @action
  handleInputChange(event) {
    const { user } = this.args;
    user.password = event.target.value;
    this.validation.password.validate(user.password);
  }

  @action
  async handleResetPassword(event) {
    if (event) event.preventDefault();

    const { user, temporaryKey } = this.args;

    const isValid = this.validation.validateAll({ password: user.password });
    if (!isValid) return;

    this.globalError = null;
    this.isLoading = true;
    this.isPasswordResetSucceeded = false;

    try {
      await user.save({ adapterOptions: { updatePassword: true, temporaryKey } });
      user.password = null;
      this.isPasswordResetSucceeded = true;
    } catch (response) {
      const error = get(response, 'errors[0]');
      const i18nKey = error.code ?? error.status;
      this.globalError = HTTP_ERROR_MESSAGES[i18nKey] || HTTP_ERROR_MESSAGES['default'];
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    {{#if this.isPasswordResetSucceeded}}
      <PasswordResetSucceededInfo />
    {{else}}
      <form class="password-reset-form" type="submit" {{on "submit" this.handleResetPassword}}>
        {{#if this.globalError}}
          <PixNotificationAlert @type="error" @withIcon={{true}} role="alert">
            {{t this.globalError}}
          </PixNotificationAlert>
        {{/if}}

        <p class="password-reset-form__mandatory-fields-message">
          {{t "common.form.mandatory-all-fields"}}
        </p>

        <NewPasswordInput
          @id="password"
          class="password-reset-form__password-input"
          name="password"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.password.status}}
          @errorMessage={{t this.validation.password.error}}
          @rules={{PASSWORD_RULES}}
          aria-required="true"
        >
          <:label>{{t "components.authentication.password-reset-form.fields.password.label"}}</:label>
        </NewPasswordInput>

        <PixButton class="password-reset-form__submit-button" @isLoading={{this.isLoading}} @type="submit">
          {{t "components.authentication.password-reset-form.actions.submit"}}
        </PixButton>
      </form>
    {{/if}}
  </template>
}

const setFocus = (element) => {
  element.focus({ focusVisible: false });
};

const PasswordResetSucceededInfo = <template>
  <div class="password-reset-succeeded-info">
    <img src="/images/success-check.svg" alt="" />
    <h2 class="password-reset-succeeded-info__heading" tabindex="-1" {{didInsert setFocus}}>
      {{t "components.authentication.password-reset-form.success-info.message"}}
    </h2>
  </div>

  <PixButtonLink @route="authentication.login">
    {{t "components.authentication.password-reset-form.actions.login"}}
  </PixButtonLink>
</template>;
