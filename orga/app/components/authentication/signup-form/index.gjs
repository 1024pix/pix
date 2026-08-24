import { PixButton, PixInput, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';

import isEmailValid from '../../../utils/email-validator.js';
import { FormValidation } from '../../../utils/form-validation';
import isPasswordValid, { PASSWORD_RULES } from '../../../utils/password-validator.js';
import NewPasswordInput from '../new-password-input';
import CguCheckbox from './cgu-checkbox';

const VALIDATION_ERRORS = {
  firstName: 'pages.join.signup.fields.firstname.error',
  lastName: 'pages.join.signup.fields.lastname.error',
  email: 'pages.join.signup.fields.email.error',
  password: 'common.validation.password.error',
  cgu: 'common.cgu.error',
};

const EMAIL_API_ERRORS = {
  INVALID_OR_ALREADY_USED_EMAIL: 'pages.join.signup.errors.invalid-or-already-used-email',
};

export default class SignupForm extends Component {
  @service locale;
  @service store;
  @service intl;
  @service authErrorMessages;

  @tracked isLoading = false;
  @tracked globalError = null;

  validation = new FormValidation({
    firstName: {
      validate: (value) => Boolean(value),
      error: VALIDATION_ERRORS.firstName,
    },
    lastName: {
      validate: (value) => Boolean(value),
      error: VALIDATION_ERRORS.lastName,
    },
    email: {
      validate: (value) => isEmailValid(value),
      error: VALIDATION_ERRORS.email,
      apiErrors: EMAIL_API_ERRORS,
    },
    password: {
      validate: (value) => isPasswordValid(value),
      error: VALIDATION_ERRORS.password,
    },
    cgu: {
      validate: (value) => value === true,
      error: VALIDATION_ERRORS.cgu,
    },
  });

  @action
  handleInputChange(event) {
    const { id, value, checked, type } = event.target;

    if (type === 'checkbox') {
      this[id] = Boolean(checked);
    } else {
      this[id] = value.trim();
    }

    this.validation[id].validate(this[id]);
  }

  @action
  async handleSignup(event) {
    if (event) event.preventDefault();

    this.globalError = null;
    this.isLoading = true;

    const user = await this.store.createRecord('user', {
      lastName: this.lastName,
      firstName: this.firstName,
      email: this.email,
      password: this.password,
      cgu: this.cgu,
      lang: this.locale.currentLanguage,
    });

    const isValid = this.validation.validateAll(user);
    if (!isValid) {
      this.isLoading = false;
      return;
    }

    try {
      await this.args.onSubmit(user);

      this.password = null;
    } catch (errorResponse) {
      if (user.errors?.length > 0) {
        return this.validation.setErrorsFromApi(user.errors);
      }
      this.globalError = this.#getApiErrorMessage(errorResponse);
    } finally {
      this.isLoading = false;
    }
  }

  #getApiErrorMessage(errorResponse) {
    // EmberAdapter and EmberSimpleAuth use different error formats, so we manage both cases below
    const error = get(errorResponse, errorResponse?.isAdapterError ? 'errors[0]' : 'responseJSON.errors[0]');
    return this.authErrorMessages.getAuthenticationErrorMessage(error);
  }

  <template>
    <form {{on "submit" this.handleSignup}} class="signup-form">
      {{#if this.globalError}}
        <PixNotificationAlert @type="error" @withIcon="true" role="alert">
          {{this.globalError}}
        </PixNotificationAlert>
      {{/if}}

      <p class="signup-form__mandatory-fields-message">
        {{t "common.form.mandatory-all-fields"}}
      </p>

      <fieldset>
        <legend class="sr-only">{{t "pages.join.signup.fields.legend"}}</legend>

        <PixInput
          @id="firstName"
          name="firstName"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.firstName.status}}
          @errorMessage={{t this.validation.firstName.error}}
          placeholder={{t "pages.join.signup.fields.firstname.placeholder"}}
          aria-required="true"
          autocomplete="given-name"
        >
          <:label>{{t "pages.join.signup.fields.firstname.label"}}</:label>
        </PixInput>

        <PixInput
          @id="lastName"
          name="lastName"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.lastName.status}}
          @errorMessage={{t this.validation.lastName.error}}
          placeholder={{t "pages.join.signup.fields.lastname.placeholder"}}
          aria-required="true"
          autocomplete="family-name"
        >
          <:label>{{t "pages.join.signup.fields.lastname.label"}}</:label>
        </PixInput>

        <PixInput
          @id="email"
          name="email"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.email.status}}
          @errorMessage={{t this.validation.email.error}}
          placeholder={{t "pages.join.signup.fields.email.placeholder"}}
          aria-required="true"
          autocomplete="email"
        >
          <:label>{{t "pages.join.signup.fields.email.label"}}</:label>
        </PixInput>

        <NewPasswordInput
          @id="password"
          name="password"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.password.status}}
          @errorMessage={{t this.validation.password.error}}
          @rules={{PASSWORD_RULES}}
          aria-required="true"
        >
          <:label>{{t "pages.join.signup.fields.password.label"}}</:label>
        </NewPasswordInput>

        <CguCheckbox
          @id="cgu"
          name="cgu"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.cgu.status}}
          @errorMessage={{t this.validation.cgu.error}}
          aria-required="true"
        />
      </fieldset>

      <PixButton @type="submit" @isLoading={{this.isLoading}}>
        {{t "pages.join.signup.submit"}}
      </PixButton>
    </form>
  </template>
}
