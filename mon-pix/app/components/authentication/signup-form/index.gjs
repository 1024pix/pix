import { PixButton, PixInput, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';
import isEmailValid from 'mon-pix/utils/email-validator.js';
import { FormValidation } from 'mon-pix/utils/form-validation';
import isPasswordValid, { PASSWORD_RULES } from 'mon-pix/utils/password-validator.js';

import NewPasswordInput from '../new-password-input';
import CguCheckbox from './cgu-checkbox';

const VALIDATION_ERRORS = {
  firstName: 'components.authentication.signup-form.fields.firstname.error',
  lastName: 'components.authentication.signup-form.fields.lastname.error',
  email: 'components.authentication.signup-form.fields.email.error',
  password: 'common.validation.password.error',
  hasAcceptedLegalDocuments: 'common.legal-documents.error',
};

const EMAIL_API_ERRORS = {
  INVALID_OR_ALREADY_USED_EMAIL: 'components.authentication.signup-form.errors.invalid-or-already-used-email',
};

export default class SignupForm extends Component {
  @service session;
  @service locale;
  @service url;
  @service errorMessages;
  @service pixMetrics;

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
    hasAcceptedLegalDocuments: {
      validate: (value) => value === true,
      error: VALIDATION_ERRORS.hasAcceptedLegalDocuments,
    },
  });

  @action
  handleInputChange(event) {
    const { user } = this.args;
    const { id, value, checked, type } = event.target;

    if (type === 'checkbox') {
      user[id] = Boolean(checked);
    } else {
      user[id] = value.trim();
    }

    this.validation[id].validate(user[id]);
  }

  @action
  async handleSignup(event) {
    if (event) event.preventDefault();
    const { user } = this.args;

    const isValid = this.validation.validateAll(user);
    if (!isValid) return;

    this.globalError = null;
    this.isLoading = true;

    try {
      user.lang = this.locale.currentLanguage;
      const wasAnonymousBeforeSaving = user.isAnonymous;
      await user.save({ adapterOptions: { redirectionUrl: this.session.redirectionUrl } });
      if (wasAnonymousBeforeSaving) {
        this.pixMetrics.trackEvent('SignUpFromAnonymousUserDone');
        this.session.set('skipRedirectAfterSessionInvalidation', true);
        await this.session.invalidate();
      }
      await this.session.authenticateUser(user.email, user.password);

      user.password = null;
    } catch (errorResponse) {
      // EmberAdapter and EmberSimpleAuth use different error formats, so we manage both cases below
      const error = get(errorResponse, errorResponse?.isAdapterError ? 'errors[0]' : 'responseJSON.errors[0]');
      this._manageApiErrors(error);
    } finally {
      this.isLoading = false;
    }
  }

  _manageApiErrors(error) {
    const statusCode = error?.status;

    if (String(statusCode) === '422') {
      const errors = this.args.user.errors || [];
      return this.validation.setErrorsFromApi(errors);
    }

    this.globalError = this.errorMessages.getAuthenticationErrorMessage(error);
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
        <legend class="sr-only">{{t "components.authentication.signup-form.fields.legend"}}</legend>

        <PixInput
          @id="firstName"
          name="firstName"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.firstName.status}}
          @errorMessage={{t this.validation.firstName.error}}
          placeholder={{t "components.authentication.signup-form.fields.firstname.placeholder"}}
          aria-required="true"
          autocomplete="given-name"
        >
          <:label>{{t "components.authentication.signup-form.fields.firstname.label"}}</:label>
        </PixInput>

        <PixInput
          @id="lastName"
          name="lastName"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.lastName.status}}
          @errorMessage={{t this.validation.lastName.error}}
          placeholder={{t "components.authentication.signup-form.fields.lastname.placeholder"}}
          aria-required="true"
          autocomplete="family-name"
        >
          <:label>{{t "components.authentication.signup-form.fields.lastname.label"}}</:label>
        </PixInput>

        <PixInput
          @id="email"
          name="email"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.email.status}}
          @errorMessage={{t this.validation.email.error}}
          placeholder={{t "components.authentication.signup-form.fields.email.placeholder"}}
          aria-required="true"
          autocomplete="email"
        >
          <:label>{{t "components.authentication.signup-form.fields.email.label"}}</:label>
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
          <:label>{{t "common.password"}}</:label>
        </NewPasswordInput>

        <CguCheckbox
          @id="hasAcceptedLegalDocuments"
          name="hasAcceptedLegalDocuments"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.hasAcceptedLegalDocuments.status}}
          @errorMessage={{t this.validation.hasAcceptedLegalDocuments.error}}
          aria-required="true"
        />
      </fieldset>

      <PixButton @type="submit" @isLoading={{this.isLoading}}>
        {{t "components.authentication.signup-form.actions.submit"}}
      </PixButton>
    </form>
  </template>
}
