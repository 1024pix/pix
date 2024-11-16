import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';
import { FormValidation } from 'mon-pix/utils/form-validation';
import isPasswordValid, { PASSWORD_RULES } from 'mon-pix/utils/password-validator.js';

import NewPasswordInput from './new-password-input';

const HTTP_ERROR_MESSAGES = {
  400: 'common.validation.password.error',
  403: 'components.authentication.password-reset-form.errors.forbidden',
  404: 'components.authentication.password-reset-form.errors.expired-demand',
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
      const status = get(response, 'errors[0].status');
      this.globalError = HTTP_ERROR_MESSAGES[status] || HTTP_ERROR_MESSAGES['default'];
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
          <PixMessage @type="error" @withIcon={{true}} role="alert">
            {{t this.globalError}}
          </PixMessage>
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

const PasswordResetSucceededInfo = <template>
  <div class="password-reset-succeeded-info">
    <img src="/images/success-check.svg" alt="" />
    <h2 class="password-reset-succeeded-info__heading">
      {{t "components.authentication.password-reset-form.success-info.message"}}
    </h2>
  </div>

  <PixButtonLink @route="authentication.login">
    {{t "components.authentication.password-reset-form.actions.login"}}
  </PixButtonLink>
</template>;
