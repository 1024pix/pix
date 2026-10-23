import { PixButton, PixInputPassword, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import isEmpty from 'lodash/isEmpty';

import { FormValidation } from '../../utils/form-validation';
import isPasswordValid, { PASSWORD_RULES } from '../../utils/password-validator';
import NewPasswordInput from '../authentication/new-password-input';

const VALIDATION_ERRORS = {
  currentPassword: 'pages.user-account.update-password.fields.errors.empty-current-password',
  newPassword: 'common.validation.password.error',
};

const API_ERRORS = {
  INVALID_CURRENT_PASSWORD: 'pages.user-account.update-password.fields.errors.invalid-current-password',
};

const ERROR_MESSAGES = {
  unknownError: 'pages.user-account.update-password.fields.errors.unknown-error',
};

export default class UpdatePasswordForm extends Component {
  @service intl;
  @service updatePassword;
  @tracked isLoading = false;
  @tracked globalError = null;
  @tracked currentPassword = '';
  @tracked newPassword = '';

  validation = new FormValidation({
    currentPassword: {
      validate: (value) => !isEmpty(value),
      error: VALIDATION_ERRORS.currentPassword,
    },
    newPassword: {
      validate: (value) => isPasswordValid(value),
      error: VALIDATION_ERRORS.newPassword,
    },
  });

  @action
  handleInputChange(event) {
    const { id, value } = event.target;
    this[id] = value;
    this.validation[id].validate(this[id]);
  }

  @action
  async onSubmit(event) {
    if (event) event.preventDefault();

    this.globalError = null;
    this.isLoading = true;

    const formData = {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    };

    const isValid = this.validation.validateAll(formData);
    if (!isValid) {
      this.isLoading = false;
      return;
    }

    try {
      await this.updatePassword.updatePassword(formData);

      this.currentPassword = '';
      this.newPassword = '';
      this.args.displayPasswordUpdatedMessage();
      this.args.disablePasswordEditionMode();
    } catch (errorResponse) {
      this.#handleApiError(errorResponse);
    } finally {
      this.isLoading = false;
    }
  }

  #handleApiError(errorResponse) {
    const status = errorResponse?.errors?.[0]?.status;

    if (status === '400') {
      this.validation.currentPassword.status = 'error';
      this.validation.currentPassword.apiError = API_ERRORS.INVALID_CURRENT_PASSWORD;
    } else if (status === '422') {
      this.validation.newPassword.status = 'error';
      this.validation.newPassword.apiError = VALIDATION_ERRORS.newPassword;
    } else {
      this.globalError = this.intl.t(ERROR_MESSAGES.unknownError);
    }
  }

  <template>
    <div class="update-password">
      <h2 class="update-password__title">
        {{t "pages.user-account.update-password.title"}}
      </h2>

      <form onSubmit={{this.onSubmit}}>
        <div class="update-password__current-password-input">
          <PixInputPassword
            @id="currentPassword"
            @validationStatus={{this.validation.currentPassword.status}}
            @errorMessage={{if this.validation.currentPassword.error (t this.validation.currentPassword.error) null}}
            {{on "input" this.handleInputChange}}
            aria-required="true"
            autocomplete="current-password"
          >
            <:label>{{t "pages.user-account.update-password.fields.current-password.label"}}</:label>
          </PixInputPassword>
        </div>

        <div class="update-password__new-password-input">
          <NewPasswordInput
            @id="newPassword"
            {{on "input" this.handleInputChange}}
            @validationStatus={{this.validation.newPassword.status}}
            @errorMessage={{t this.validation.newPassword.error}}
            @rules={{PASSWORD_RULES}}
            aria-required="true"
          >
            <:label>{{t "pages.user-account.update-password.fields.new-password.label"}}</:label>
          </NewPasswordInput>
        </div>

        {{#if this.globalError}}
          <PixNotificationAlert @type="error" @withIcon={{true}} role="alert">
            {{this.globalError}}
          </PixNotificationAlert>
        {{/if}}

        <div class="update-password__action-buttons">
          <PixButton @type="submit" @isLoading={{this.isLoading}} class="update-password-actions__confirm-button">
            {{t "pages.user-account.update-password.save-button"}}
          </PixButton>

          <PixButton @triggerAction={{@disablePasswordEditionMode}} @variant="secondary">
            {{t "common.actions.cancel"}}
          </PixButton>
        </div>
      </form>
    </div>
  </template>
}
