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

import { PASSWORD_RULES } from '../../../utils/password-validator.js';
import NewPasswordInput from '../new-password-input';
import { PasswordResetFormValidation } from './password-reset-form-validation';

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
  @tracked validation = new PasswordResetFormValidation(this.intl);
  @tracked globalErrorMessage;

  @action
  handleInputChange(event) {
    const { user } = this.args;
    user.password = event.target.value;
    this.validation.validateField(user.password);
  }

  @action
  async handleResetPassword(event) {
    if (event) event.preventDefault();

    if (!this.validation.isValid) return;

    this.globalErrorMessage = null;
    this.isLoading = true;
    this.isPasswordResetSucceeded = false;
    try {
      const { user, temporaryKey } = this.args;
      await user.save({ adapterOptions: { updatePassword: true, temporaryKey } });
      user.password = null;
      this.isPasswordResetSucceeded = true;
    } catch (response) {
      const status = get(response, 'errors[0].status');
      this.globalErrorMessage = this.intl.t(HTTP_ERROR_MESSAGES[status] || HTTP_ERROR_MESSAGES['default']);
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    {{#if this.isPasswordResetSucceeded}}
      <PasswordResetSucceededInfo />
    {{else}}
      <form class="password-reset-form" type="submit" {{on "submit" this.handleResetPassword}}>
        {{#if this.globalErrorMessage}}
          <PixMessage @type="error" @withIcon={{true}} role="alert">
            {{this.globalErrorMessage}}
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
          @errorMessage={{this.validation.password.errorMessage}}
          @rules={{PASSWORD_RULES}}
          required
        >
          <:label>{{t "components.authentication.password-reset-form.fields.password.label"}}</:label>
        </NewPasswordInput>

        <PixButton
          class="password-reset-form__submit-button"
          @isLoading={{this.isLoading}}
          @size="large"
          @type="submit"
        >
          {{t "components.authentication.password-reset-form.actions.submit"}}
        </PixButton>
      </form>
    {{/if}}
  </template>
}

const PasswordResetSucceededInfo = <template>
  <div class="password-reset-succeeded-info" role="alert">
    <img src="/images/success-check.svg" alt="" />
    <h2 class="password-reset-succeeded-info__heading">
      {{t "components.authentication.password-reset-form.success-info.message"}}
    </h2>
  </div>

  <PixButtonLink @route="authentication.login" @size="large">
    {{t "components.authentication.password-reset-form.actions.login"}}
  </PixButtonLink>
</template>;
