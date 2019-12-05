import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

import isEmailValid from '../../utils/email-validator';
import isPasswordValid from '../../utils/password-validator';

const ERROR_INPUT_MESSAGE_MAP = {
  firstName: 'Votre prénom n’est pas renseigné.',
  lastName: 'Votre nom n’est pas renseigné.',
  email: 'Votre email n’est pas valide.',
  password: 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.'
};

const validation = {
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
  }
};

export default Component.extend({

  session: inject(),
  store: inject(),

  user: null,
  isLoading: false,
  validation: validation,
  isPasswordVisible: false,

  passwordInputType: computed('isPasswordVisible', function() {
    return this.isPasswordVisible ? 'text' : 'password';
  }),

  init() {
    this._super(...arguments);
    this.user = this.store.createRecord('user', {
      lastName: '',
      firstName: '',
      email: '',
      password: ''
    });
  },

  actions: {
    async register() {
      this.set('isLoading', true);
      try {
        await this.user.save();
      } catch (e) {
        this.set('isLoading', false);
        return this._updateInputsStatus();
      }

      this._authenticate(this.get('user.email'), this.get('user.password'));

      this.set('user.password', null);
      this.set('isLoading', false);
    },

    togglePasswordVisibility() {
      this.toggleProperty('isPasswordVisible');
    },

    validateInput(key, value) {
      const isValuePresent = (value) => !!value.trim();
      this._executeFieldValidation(key, value, isValuePresent);
    },

    validateInputEmail(key, value) {
      this._executeFieldValidation(key, value, isEmailValid);
    },

    validateInputPassword(key, value) {
      this._executeFieldValidation(key, value, isPasswordValid);
    },
  },

  _updateInputsStatus() {
    const errors = this.get('user.errors');
    errors.forEach(({ attribute, message }) => {
      const statusObject = 'validation.' + attribute + '.status';
      const messageObject = 'validation.' + attribute + '.message';
      this.set(statusObject, 'error');
      this.set(messageObject, message);
    });
  },

  _executeFieldValidation(key, value, isValid) {
    const isInputValid = !isValid(value);
    const message = isInputValid ? ERROR_INPUT_MESSAGE_MAP[key] : null;
    const status =  isInputValid ? 'error' : 'success';
    const statusObject = 'validation.' + key + '.status';
    const messageObject = 'validation.' + key + '.message';
    this.set(statusObject, status);
    this.set(messageObject, message);
  },

  async _authenticate(email, password) {
    const scope = 'mon-pix';
    await this.session.authenticate('authenticator:oauth2', { email, password, scope });
  },

});
