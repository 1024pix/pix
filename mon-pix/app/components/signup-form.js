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

class SignupFormValidation {
  lastName = {
    @tracked status: 'default',
    @tracked message: null,
  }
  firstName = {
    @tracked status: 'default',
    @tracked message: null,
  }
  email = {
    @tracked status: 'default',
    @tracked message: null,
  }
  password = {
    @tracked status: 'default',
    @tracked message: null,
  }
  cgu = {
    @tracked status: 'default',
    @tracked message: null,
  }
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

  get homeUrl() {
    return this.url.homeUrl;
  }

  get cguUrl() {
    return this.url.cguUrl;
  }

  _getErrorMessage(status, key) {
    return (status === 'error') ? this.intl.t(ERROR_INPUT_MESSAGE_MAP[key]) : null;
  }

  _getValidationStatus(isValidField) {
    return (isValidField) ? 'error' : 'success';
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
  signup(event) {
    event && event.preventDefault();
    this.notificationMessage = null;
    this.isLoading = true;

    this._trimNamesAndEmailOfUser();
    this.args.user.lang = this.intl.t('current-lang');

    const campaignCode = get(this.session, 'attemptedTransition.from.parent.params.code');
    this.args.user.save({ adapterOptions: { campaignCode } }).then(() => {
      const credentials = { login: this.args.user.email, password: this.args.user.password };
      this.args.authenticateUser(credentials);
      this._tokenHasBeenUsed = true;
      this.args.user.password = null;
    }).catch((response) => {
      const error = get(response, 'errors[0]');
      if (error) {
        this._manageErrorsApi(error);
      } else {
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE);
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
      '400': ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE,
      '500': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '502': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '504': ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.MESSAGE,
      'default': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
    };
    return this.intl.t(httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
  }
}
