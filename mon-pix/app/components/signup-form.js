import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import isEmailValid from '../utils/email-validator';
import isPasswordValid from '../utils/password-validator';
import ENV from 'mon-pix/config/environment';

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'pages.sign-up.fields.firstname.error',
  lastName: 'pages.sign-up.fields.lastname.error',
  email: 'pages.sign-up.fields.email.error',
  password: 'pages.sign-up.fields.password.error',
};
const FRENCH_DOMAIN_TLD = 'fr';
const INTERNATIONAL_DOMAIN_TLD = 'org';
const FRENCH_LOCALE = 'fr-FR';

class LastName {
  @tracked status = 'default';
  @tracked message = null;
}

class FirstName {
  @tracked status = 'default';
  @tracked message = null;
}

class Email {
  @tracked status = 'default';
  @tracked message = null;
}

class Password {
  @tracked status = 'default';
  @tracked message = null;
}

class Cgu {
  @tracked status = 'default';
  @tracked message = null;
}

class SignupFormValidation {
  lastName = new LastName();
  firstName = new FirstName();
  email = new Email();
  password = new Password();
  cgu = new Cgu();
}

export default class SignupForm extends Component {
  @service session;
  @service intl;
  @service url;
  @service cookies;
  @service currentDomain;

  @tracked errorMessage = null;
  @tracked isLoading = false;
  @tracked validation = new SignupFormValidation();
  _tokenHasBeenUsed = null;

  get showcase() {
    return this.url.showcase;
  }

  get cguUrl() {
    return this.url.cguUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  _getErrorMessage(status, key) {
    return status === 'error' ? this.intl.t(ERROR_INPUT_MESSAGE_MAP[key]) : null;
  }

  _getValidationStatus(isValidField) {
    return isValidField ? 'error' : 'success';
  }

  _isValuePresent(value) {
    return value.trim() ? true : false;
  }

  _updateValidationStatus(key, status, message) {
    this.validation[key].status = status;
    this.validation[key].message = message;
  }

  _updateInputsStatus() {
    const errors = this.args.user.errors;
    errors.forEach(({ attribute, message }) => {
      this._updateValidationStatus(attribute, 'error', message);
    });
  }

  _executeFieldValidation(key, isValid) {
    const modelAttrValue = this.args.user[key];
    const isValidInput = !isValid(modelAttrValue);
    const status = this._getValidationStatus(isValidInput);
    const message = this._getErrorMessage(status, key);
    this._updateValidationStatus(key, status, message);
  }

  _trimNamesAndEmailOfUser() {
    const { firstName, lastName, email } = this.args.user;
    this.args.user.firstName = firstName.trim();
    this.args.user.lastName = lastName.trim();
    this.args.user.email = email.trim();
  }

  @action
  resetTokenHasBeenUsed() {
    this._tokenHasBeenUsed = false;
  }

  @action
  validateFirstName(event) {
    this.args.user.firstName = event.target.value?.trim();
    this._executeFieldValidation(event.target.id, this._isValuePresent);
  }

  @action
  validateLastName(event) {
    this.args.user.lastName = event.target.value?.trim();
    this._executeFieldValidation(event.target.id, this._isValuePresent);
  }

  @action
  validateEmail(event) {
    this.args.user.email = event.target.value?.trim();
    this._executeFieldValidation(event.target.id, isEmailValid);
  }

  @action
  validatePassword(event) {
    this.args.user.password = event.target.value?.trim();
    this._executeFieldValidation(event.target.id, isPasswordValid);
  }

  @action
  onChange(event) {
    this.args.user.cgu = !!event.target.checked;
  }

  @action
  async signup(event) {
    event && event.preventDefault();
    this.isLoading = true;

    this._trimNamesAndEmailOfUser();
    this.args.user.lang = this.intl.t('current-lang');
    this.args.user.locale = this._getLocaleFromCookieOrDomain();

    const campaignCode = get(this.session, 'attemptedTransition.from.parent.params.code');

    try {
      await this.args.user.save({ adapterOptions: { campaignCode } });
      await this.session.authenticateUser(this.args.user.email, this.args.user.password);
      this._tokenHasBeenUsed = true;
      this.args.user.password = null;
    } catch (errorResponse) {
      const error = get(errorResponse, 'errors[0]');
      if (error) {
        this._manageErrorsApi(error);
      } else {
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY);
      }
      this._tokenHasBeenUsed = true;
      this.isLoading = false;
    }
  }

  _manageErrorsApi(firstError) {
    const statusCode = get(firstError, 'status');

    if (statusCode === '422') {
      return this._updateInputsStatus();
    }

    switch (firstError?.code) {
      case 'INVALID_LOCALE_FORMAT':
        this.errorMessage = this.intl.t('pages.sign-up.errors.invalid-locale-format', {
          invalidLocale: firstError.meta.locale,
        });
        return;
      case 'LOCALE_NOT_SUPPORTED':
        this.errorMessage = this.intl.t('pages.sign-up.errors.locale-not-supported', {
          localeNotSupported: firstError.meta.locale,
        });
        return;
    }

    this.errorMessage = this._getErrorMessagesByStatusCode(statusCode);
  }

  _getErrorMessagesByStatusCode(statusCode) {
    const httpStatusCodeMessages = {
      400: ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY,
      500: ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY,
      502: ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY,
      504: ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY,
      default: ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY,
    };
    return this.intl.t(httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
  }

  _getLocaleFromCookieOrDomain() {
    const currentDomainExtension = this.currentDomain.getExtension();
    const cookieLocale = this.cookies.read('locale');
    const currentLocale = this.intl.get('locale')[0];

    if (currentDomainExtension === INTERNATIONAL_DOMAIN_TLD) {
      if (cookieLocale) {
        return cookieLocale;
      }

      return currentLocale;
    }

    if (currentDomainExtension === FRENCH_DOMAIN_TLD) {
      return FRENCH_LOCALE;
    }

    return currentLocale;
  }
}
