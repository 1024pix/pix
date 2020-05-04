import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import isEmailValid from 'mon-pix/utils/email-validator';
import isPasswordValid from '../utils/password-validator';
import ENV from 'mon-pix/config/environment';

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'Votre prénom n’est pas renseigné.',
  lastName: 'Votre nom n’est pas renseigné.',
  email: 'Votre adresse e-mail n’est pas valide.',
  password: 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.'
};
const TEMPORARY_DIV_CLASS_MAP = {
  error: 'signup-form__temporary-msg--error',
  success: 'signup-form__temporary-msg--success'
};

function getErrorMessage(status, key) {
  return (status === 'error') ? ERROR_INPUT_MESSAGE_MAP[key] : null;
}

function getValidationStatus(isValidField) {
  return (isValidField) ? 'error' : 'success';
}

function isValuePresent(value) {
  return value.trim() ? true : false;
}

export default Component.extend({

  session: service(),

  _notificationMessage: null,
  validation: null,
  _tokenHasBeenUsed: null,
  urlHome: ENV.APP.HOME_HOST,
  isRecaptchaEnabled: ENV.APP.IS_RECAPTCHA_ENABLED,
  isLoading: false,

  init() {
    this._super(...arguments);
    this._resetValidationFields();
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

  _toggleConfirmation(status, message) {
    this.set('temporaryAlert', { status: TEMPORARY_DIV_CLASS_MAP[status], message });
    if (ENV.APP.isMessageStatusTogglingEnabled) {
      later(() => {
        this.set('temporaryAlert', { status: 'default', message: '' });
      }, ENV.APP.MESSAGE_DISPLAY_DURATION);
    }
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
    const status = getValidationStatus(isValidInput);
    const message = getErrorMessage(status, key);
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
      this._executeFieldValidation(key, isValuePresent);
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

      this.user.save().then(() => {
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
