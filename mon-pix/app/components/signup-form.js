/* eslint ember/no-actions-hash: 0 */
/* eslint ember/no-classic-classes: 0 */
/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import { inject as service } from '@ember/service';
import Component from '@ember/component';
import isEmailValid from 'mon-pix/utils/email-validator';
import isPasswordValid from '../utils/password-validator';
import ENV from 'mon-pix/config/environment';
const _ = require('lodash');

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'signup-form.fields.firstname.error',
  lastName: 'signup-form.fields.lastname.error',
  email: 'signup-form.fields.email.error',
  password: 'signup-form.fields.password.error'
};

export default Component.extend({

  session: service(),
  intl: service(),
  url: service(),

  _notificationMessage: null,
  validation: null,
  _tokenHasBeenUsed: null,
  isRecaptchaEnabled: ENV.APP.IS_RECAPTCHA_ENABLED,
  isLoading: false,

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
        message: null
      },
      firstName: {
        status: 'default',
        message: null
      },
      email: {
        status: 'default',
        message: null
      },
      password: {
        status: 'default',
        message: null
      },
      cgu: {
        status: 'default',
        message: null
      },
      recaptchaToken: {
        status: 'default',
        message: null
      }
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

      const campaignCode = _.get(this.session, 'attemptedTransition.from.parent.params.code');

      this.user.save({ adapterOptions: { campaignCode } }).then(() => {
        const credentials = { login: this.user.email, password: this.user.password };
        this.authenticateUser(credentials);
        this.set('_tokenHasBeenUsed', true);
        this.set('user.password', null);
      }).catch(() => {
        this._updateInputsStatus();
        this.set('_tokenHasBeenUsed', true);
        this.set('isLoading', false);
      });
    }
  }
});
