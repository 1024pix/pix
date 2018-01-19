import { later } from '@ember/runloop';
import Component from '@ember/component';
import isEmailValid from 'pix-live/utils/email-validator';
import isPasswordValid from '../utils/password-validator';
import config from 'pix-live/config/environment';

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'Votre prénom n’est pas renseigné.',
  lastName: 'Votre nom n’est pas renseigné.',
  email: 'Votre email n’est pas valide.',
  password: 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.'
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
  classNames: ['signup-form'],

  _notificationMessage: null,
  validation: null,
  _tokenHasBeenUsed: null,

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
    const userModel = this.get('user');
    return userModel.get(key);
  },

  _toggleConfirmation(status, message) {
    this.set('temporaryAlert', { status: TEMPORARY_DIV_CLASS_MAP[status], message });
    if(config.APP.isMessageStatusTogglingEnabled) {
      later(() => {
        this.set('temporaryAlert', { status: 'default', message: '' });
      }, config.APP.MESSAGE_DISPLAY_DURATION);
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
    const errors = this.get('user.errors.content');
    errors.forEach(({ attribute, message }) => {
      this._updateValidationStatus(attribute, 'error', message);
    });
  },

  _executeFieldValidation: function(key, isValid) {
    const modelAttrValue = this._getModelAttributeValueFromKey(key);
    const isValidInput = !isValid(modelAttrValue);
    const status = getValidationStatus(isValidInput);
    const message = getErrorMessage(status, key);
    this._updateValidationStatus(key, status, message);
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
      this.get('user').save().then(() => {
        const credentials = { email: this.get('user.email'), password: this.get('user.password') };
        this.sendAction('redirectToProfileRoute', credentials);
        this.set('_tokenHasBeenUsed', true);
      }).catch(() => {
        this._updateInputsStatus();
        this.set('_tokenHasBeenUsed', true);
      });
    }
  }
});
