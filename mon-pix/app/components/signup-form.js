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

  @tracked errorMessage = null;
  @tracked isLoading = false;
  @tracked notificationMessage = null;
  @tracked validation = new SignupFormValidation();
  _tokenHasBeenUsed = null;

  get showcaseUrl() {
    return this.url.showcaseUrl;
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
  validateInput(key) {
    this._executeFieldValidation(key, this._isValuePresent);
  }

  @action
  validateInputEmail(key) {
    this._executeFieldValidation(key, isEmailValid);
  }

  @action
  validateInputPassword(key) {
    this._executeFieldValidation(key, isPasswordValid);
  }

  @action
  onChange(event) {
    this.args.user.cgu = !!event.target.checked;
  }

  @action
  signup(event) {
    event && event.preventDefault();
    this.notificationMessage = null;
    this.isLoading = true;

    this._trimNamesAndEmailOfUser();
    this.args.user.lang = this.intl.t('current-lang');

    const campaignCode = get(this.session, 'attemptedTransition.from.parent.params.code');
    this.args.user
      .save({ adapterOptions: { campaignCode } })
      .then(async () => {
        await this.session.authenticateUser(this.args.user.email, this.args.user.password);
        this._tokenHasBeenUsed = true;
        this.args.user.password = null;
      })
      .catch((response) => {
        const error = get(response, 'errors[0]');
        if (error) {
          this._manageErrorsApi(error);
        } else {
          this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY);
        }
        this._tokenHasBeenUsed = true;
        this.isLoading = false;
      });
  }

  _manageErrorsApi(firstError) {
    const statusCode = get(firstError, 'status');
    if (statusCode === '422') {
      return this._updateInputsStatus();
    }
    this.errorMessage = this._showErrorMessages(statusCode);
  }

  _showErrorMessages(statusCode) {
    const httpStatusCodeMessages = {
      400: ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY,
      500: ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY,
      502: ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY,
      504: ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY,
      default: ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY,
    };
    return this.intl.t(httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
  }
}
