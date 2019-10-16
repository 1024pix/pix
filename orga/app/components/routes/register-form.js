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
    message: null
  },
  firstName: {
    message: null
  },
  email: {
    message: null
  },
  password: {
    message: null
  },
  cgu: {
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
      password: '',
      cgu: false
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

      await this._acceptOrganizationInvitation(this.organizationInvitationId, this.organizationInvitationCode, this.get('user.email'));
      await this._authenticate(this.get('user.email'), this.get('user.password'));

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
      const messageObject = 'validation.' + attribute + '.message';
      this.set(messageObject, message);
    });
  },

  _executeFieldValidation(key, value, isValid) {
    const isInvalidInput = !isValid(value);
    const message = isInvalidInput ? ERROR_INPUT_MESSAGE_MAP[key] : null;
    const messageObject = 'validation.' + key + '.message';
    this.set(messageObject, message);
  },

  _acceptOrganizationInvitation(organizationInvitationId, organizationInvitationCode, createdUserEmail) {
    const status = 'accepted';
    return this.store.createRecord('organization-invitation-response', {
      id: organizationInvitationId + '_' + organizationInvitationCode,
      code: organizationInvitationCode,
      status,
      email: createdUserEmail,
    }).save({ adapterOptions: { organizationInvitationId } });
  },

  _authenticate(email, password) {
    const scope = 'pix-orga';
    return this.session.authenticate('authenticator:oauth2', email, password, scope);
  },

});
