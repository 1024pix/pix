import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';
import isEmailValid from 'mon-pix/utils/email-validator.js';
import { FormValidation } from 'mon-pix/utils/form-validation';
import isPasswordValid, { PASSWORD_RULES } from 'mon-pix/utils/password-validator.js';

import NewPasswordInput from '../new-password-input';
import CguCheckbox from './cgu-checkbox';

const HTTP_ERROR_MESSAGES = {
  400: { key: ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY },
  504: { key: ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY },
  default: { key: 'common.api-error-messages.login-unexpected-error', values: { htmlSafe: true } },
};

const VALIDATION_ERRORS = {
  firstName: 'components.authentication.signup-form.fields.firstname.error',
  lastName: 'components.authentication.signup-form.fields.lastname.error',
  email: 'components.authentication.signup-form.fields.email.error',
  password: 'common.validation.password.error',
  cgu: 'common.cgu.error',
};

const EMAIL_API_ERRORS = {
  INVALID_OR_ALREADY_USED_EMAIL: 'components.authentication.signup-form.errors.invalid-or-already-used-email',
};

export default class SignupForm extends Component {
  @service session;
  @service intl;
  @service url;

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
      user.lang = this.intl.primaryLocale;

      await user.save({ adapterOptions: { redirectionUrl: this.session.redirectionUrl } });
      await this.session.authenticateUser(user.email, user.password);

      user.password = null;
    } catch (errorResponse) {
      // Error response format is different from EmberAdapter and EmberSimpleAuth
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

    switch (error?.code) {
      case 'INVALID_LOCALE_FORMAT':
        this.globalError = {
          key: 'components.authentication.signup-form.errors.invalid-locale-format',
          values: { invalidLocale: error.meta.locale },
        };
        return;
      case 'LOCALE_NOT_SUPPORTED':
        this.globalError = {
          key: 'components.authentication.signup-form.errors.locale-not-supported',
          values: { localeNotSupported: error.meta.locale },
        };
        return;
      default: {
        const properties = HTTP_ERROR_MESSAGES[statusCode] || HTTP_ERROR_MESSAGES['default'];
        if (!HTTP_ERROR_MESSAGES[statusCode]) {
          properties.values.supportHomeUrl = this.url.supportHomeUrl;
        }
        this.globalError = properties;
        return;
      }
    }
  }

  <template>
    <form {{on "submit" this.handleSignup}} class="signup-form">
      {{#if this.globalError}}
        <PixNotificationAlert @type="error" @withIcon="true" role="alert">
          {{t this.globalError.key this.globalError.values}}
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
          @id="cgu"
          name="cgu"
          {{on "change" this.handleInputChange}}
          @validationStatus={{this.validation.cgu.status}}
          @errorMessage={{t this.validation.cgu.error}}
          aria-required="true"
        />
      </fieldset>

      <PixButton @type="submit" @isLoading={{this.isLoading}}>
        {{t "components.authentication.signup-form.actions.submit"}}
      </PixButton>
    </form>
  </template>
}
