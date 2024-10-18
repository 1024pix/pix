import PixButton from '@1024pix/pix-ui/components/pix-button';
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

export default class PasswordResetForm extends Component {
  @service intl;

  @tracked hasSucceeded = false;
  @tracked isLoading = false;
  @tracked validation = new PasswordResetFormValidation(this.intl);
  @tracked globalError = {};

  @action
  handleInputChange(event) {
    const { user } = this.args;
    user.password = event.target.value;
    this.validation.validateField(user.password);
  }

  @action
  async handleResetPassword(event) {
    event && event.preventDefault();

    this.hasSucceeded = false;
    this.isLoading = true;
    try {
      await this.args.user.save({ adapterOptions: { updatePassword: true, temporaryKey: this.args.temporaryKey } });
      this.hasSucceeded = true;
      this.args.user.password = null;
    } catch (response) {
      this._manageApiErrors();
    } finally {
      this.isLoading = false;
    }
  }

  _manageApiErrors(response) {
    const status = get(response, 'errors[0].status');
    this.errorMessage.status = 'error';
    switch (status) {
      case '400':
        this.errorMessage.message = this.intl.t('pages.reset-password.error.wrong-format');
        break;
      case '403':
        this.errorMessage.message = this.intl.t('pages.reset-password.error.forbidden');
        break;
      case '404':
        this.errorMessage.message = this.intl.t('pages.reset-password.error.expired-demand');
        break;
      case '500':
        this.errorMessage.message = this.intl.t('common.api-error-messages.internal-server-error');
        break;
      default:
        this.errorMessage.message = this.intl.t('common.api-error-messages.internal-server-error');
        break;
    }
  }

  <template>
    <form class="password-reset-form" type="submit" {{on "submit" this.handleResetPassword}}>
      {{#if this.globalError.message}}
        <PixMessage @type="error" @withIcon="true" role="alert">
          {{this.globalError.message}}
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
        @validationStatus={{this.passwordValidation.password.status}}
        @errorMessage={{this.validation.password.errorMessage}}
        @rules={{PASSWORD_RULES}}
        required
      >
        <:label>{{t "components.authentication.password-reset-form.password-input-label"}}</:label>
      </NewPasswordInput>
      <PixButton
        class="password-reset-form__submit-button"
        @isLoading={{this.isLoading}}
        @size="large"
        @type="submit"
      >{{t "components.authentication.password-reset-form.actions.submit"}}</PixButton>
    </form>
  </template>
}
