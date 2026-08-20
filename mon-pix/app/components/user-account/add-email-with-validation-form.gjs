import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import get from 'lodash/get';

import isEmailValid from '../../utils/email-validator';
import { FormValidation } from '../../utils/form-validation';
import isPasswordValid, { PASSWORD_RULES } from '../../utils/password-validator';
import NewPasswordInput from '../authentication/new-password-input';

const VALIDATION_ERRORS = {
  email: 'pages.user-account.account-add-or-update-email-with-validation.fields.errors.invalid-email',
  password: 'common.validation.password.error',
};

const EMAIL_API_ERRORS = {
  INVALID_OR_ALREADY_USED_EMAIL:
    'pages.user-account.account-add-or-update-email-with-validation.fields.errors.invalid-or-already-used-email',
};

const ERROR_MESSAGES = {
  emptyPassword: 'pages.user-account.account-add-or-update-email-with-validation.fields.errors.empty-password',
  invalidPassword: 'pages.user-account.account-add-or-update-email-with-validation.fields.errors.invalid-password',
  unknownError: 'pages.user-account.account-add-or-update-email-with-validation.fields.errors.unknown-error',
};

export default class AddEmailWithValidationForm extends Component {
  @service intl;
  @service emailVerificationCode;
  @tracked isLoading = false;
  @tracked globalError = null;
  @tracked email = '';
  @tracked password = '';

  validation = new FormValidation({
    email: {
      validate: (value) => isEmailValid(value),
      error: VALIDATION_ERRORS.email,
      apiErrors: EMAIL_API_ERRORS,
    },
    password: {
      validate: (value) => isPasswordValid(value),
      error: VALIDATION_ERRORS.password,
    },
  });

  @action
  handleInputChange(event) {
    const { id, value } = event.target;
    this[id] = value.trim();
    this.validation[id].validate(this[id]);
  }

  @action
  async onSubmit(event) {
    if (event) event.preventDefault();

    this.globalError = null;
    this.isLoading = true;

    const formData = {
      email: this.email,
      password: this.password,
    };

    const isValid = this.validation.validateAll(formData);
    if (!isValid) {
      this.isLoading = false;
      return;
    }

    try {
      await this.emailVerificationCode.sendNewEmail({
        password: this.password,
        newEmail: this.email,
        action: 'add-email',
      });

      this.args.showVerificationCode({
        newEmail: this.email,
        password: this.password,
      });

      this.password = '';
    } catch (errorResponse) {
      if (errorResponse.errors?.length > 0) {
        this.#handleApiError(errorResponse);
      } else {
        this.globalError = this.intl.t(ERROR_MESSAGES.unknownError);
      }
    } finally {
      this.isLoading = false;
    }
  }

  #handleApiError(errorResponse) {
    const status = get(errorResponse, 'errors[0].status');
    const pointer = get(errorResponse, 'errors[0].source.pointer');

    if (status === '422') {
      if (pointer?.endsWith('email')) {
        this.validation.email.status = 'error';
        this.validation.email.apiError = EMAIL_API_ERRORS.INVALID_OR_ALREADY_USED_EMAIL;
      } else if (pointer?.endsWith('password')) {
        this.validation.password.status = 'error';
        this.validation.password.apiError = ERROR_MESSAGES.emptyPassword;
      }
    } else if (status === '400') {
      this.globalError = this.intl.t(ERROR_MESSAGES.invalidPassword);
    } else {
      this.globalError = this.intl.t(ERROR_MESSAGES.unknownError);
    }
  }

  <template>
    <div class="add-email-with-validation">
      <h2 class="add-email-with-validation__title">
        {{t "pages.user-account.account-add-or-update-email-with-validation.title.add-email"}}
      </h2>

      <form class="add-email-with-validation__form" onSubmit={{this.onSubmit}}>
        <fieldset class="add-email-with-validation__form__fieldset">
          <PixInput
            @id="email"
            type="email"
            {{on "change" this.handleInputChange}}
            @validationStatus={{this.validation.email.status}}
            @errorMessage={{t this.validation.email.error}}
            aria-required="true"
            autocomplete="email"
          >
            <:label>{{t
                "pages.user-account.account-add-or-update-email-with-validation.fields.email.add-email.label"
              }}</:label>
          </PixInput>

          <NewPasswordInput
            @id="password"
            {{on "input" this.handleInputChange}}
            @validationStatus={{this.validation.password.status}}
            @errorMessage={{t this.validation.password.error}}
            @rules={{PASSWORD_RULES}}
            aria-required="true"
          >
            <:label>{{t "common.password"}}</:label>
          </NewPasswordInput>
        </fieldset>

        {{#if this.globalError}}
          <PixNotificationAlert @type="error" @withIcon={{true}} role="alert">
            {{this.globalError}}
          </PixNotificationAlert>
        {{/if}}

        <p class="add-email-with-validation__code-info">{{t
            "pages.user-account.account-add-or-update-email-with-validation.code-reception-information"
          }}</p>

        <div class="add-email-with-validation__actions">
          <PixButton
            @type="submit"
            @isLoading={{this.isLoading}}
            class="add-email-with-validation-actions__confirm-button"
          >
            {{t "pages.user-account.account-add-or-update-email-with-validation.save-button"}}
          </PixButton>

          <PixButton @triggerAction={{@disableEmailEditionMode}} @variant="secondary">
            {{t "common.actions.cancel"}}
          </PixButton>

        </div>
      </form>
    </div>
  </template>
}
