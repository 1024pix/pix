/* eslint ember/no-actions-hash: 0 */
/* eslint ember/no-classic-classes: 0 */
/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import { inject as service } from '@ember/service';
import Component from '@ember/component';
import get from 'lodash/get';
import isEmailValid from 'mon-pix/utils/email-validator';
import isPasswordValid from '../utils/password-validator';
import ENV from 'mon-pix/config/environment';

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'pages.sign-up.fields.firstname.error',
  lastName: 'pages.sign-up.fields.lastname.error',
  email: 'pages.sign-up.fields.email.error',
  password: 'pages.sign-up.fields.password.error',
};

export default Component.extend({

  session: service(),
  intl: service(),
  url: service(),

  _notificationMessage: null,
  validation: null,
  _tokenHasBeenUsed: null,
  isLoading: false,
  errorMessage: null,

  init() {
    this._super(...arguments);
    this._resetValidationFields();
  },

  get homeUrl() {
    return this.url.homeUrl;
  },

  get cguUrl() {
    return this.url.cguUrl;
  },

  _getErrorMessage(status, key) {
    return (status === 'error') ? this.intl.t(ERROR_INPUT_MESSAGE_MAP[key]) : null;
  },

  _getValidationStatus(isValidField) {
    return (isValidField) ? 'error' : 'success';
  },

  _isValuePresent(value) {
    return value.trim() ? true : false;
  },

  _updateValidationStatus(key, status, message) {
    const statusObject = 'validation.' + key + '.status';
    const messageObject = 'validation.' + key + '.message';
    this.set(statusObject, status);
    this.set(messageObject, message);
  },

  _getModelAttributeValueFromKey(key) {
    const userModel = this.user;
    return userModel.get(key);
  },

  _resetValidationFields() {
    const defaultValidationObject = {
      lastName: {
        status: 'default',
        message: null,
      },
      firstName: {
        status: 'default',
        message: null,
      },
      email: {
        status: 'default',
        message: null,
      },
      password: {
        status: 'default',
        message: null,
      },
      cgu: {
        status: 'default',
        message: null,
      },
    };

    this.set('validation', defaultValidationObject);
  },

  _updateInputsStatus() {
    const errors = this.user.errors;
    errors.forEach(({ attribute, message }) => {
      this._updateValidationStatus(attribute, 'error', message);
    });
  },

  _executeFieldValidation(key, isValid) {
    const modelAttrValue = this._getModelAttributeValueFromKey(key);
    const isValidInput = !isValid(modelAttrValue);
    const status = this._getValidationStatus(isValidInput);
    const message = this._getErrorMessage(status, key);
    this._updateValidationStatus(key, status, message);
  },

  _trimNamesAndEmailOfUser() {
    const { firstName, lastName, email } = this.user;
    this.set('user.firstName', firstName.trim());
    this.set('user.lastName', lastName.trim());
    this.set('user.email', email.trim());
  },

  actions: {

    resetTokenHasBeenUsed() {
      this.set('_tokenHasBeenUsed', false);
    },

    validateInput(key) {
      this._executeFieldValidation(key, this._isValuePresent);
    },

    validateInputEmail(key) {
      this._executeFieldValidation(key, isEmailValid);
    },

    validateInputPassword(key) {
      this._executeFieldValidation(key, isPasswordValid);
    },

    signup() {
      this.set('_notificationMessage', null);
      this.set('isLoading', true);

      this._trimNamesAndEmailOfUser();
      this.set('user.lang', this.intl.t('current-lang'));

      const campaignCode = get(this.session, 'attemptedTransition.from.parent.params.code');
      this.user.save({ adapterOptions: { campaignCode } }).then(() => {
        const credentials = { login: this.user.email, password: this.user.password };
        this.authenticateUser(credentials);
        this.set('_tokenHasBeenUsed', true);
        this.set('user.password', null);
      }).catch((response) => {
        const error = get(response, 'errors[0]');
        if (error) {
          this._manageErrorsApi(error);
        }
        else {
          this.set('errorMessage', this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE));
        }
        this.set('_tokenHasBeenUsed', true);
        this.set('isLoading', false);
      });
    },
  },

  _manageErrorsApi(firstError) {
    const statusCode = get(firstError, 'status');
    if (statusCode === '422') {
      return this._updateInputsStatus();
    }
    this.set('errorMessage', this._showErrorMessages(statusCode));
  },

  _showErrorMessages(statusCode) {
    const httpStatusCodeMessages = {
      '400': ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE,
      '500': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '502': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '504': ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.MESSAGE,
      'default': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
    };
    return this.intl.t(httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
  },
});
