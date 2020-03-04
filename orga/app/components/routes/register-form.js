import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

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

export default class RegisterForm extends Component {
  @service session;

  @service store;

  user = null;
  isLoading = false;
  validation = validation;
  isPasswordVisible = false;

  @computed('isPasswordVisible')
  get passwordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  init() {
    super.init(...arguments);
    this.user = this.store.createRecord('user', {
      lastName: '',
      firstName: '',
      email: '',
      password: '',
      cgu: false
    });
  }

  @action
  async register(event) {
    event.preventDefault();
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
  }

  @action
  togglePasswordVisibility() {
    this.toggleProperty('isPasswordVisible');
  }

  @action
  validateInput(key, value) {
    const isValuePresent = (value) => !!value.trim();
    this._executeFieldValidation(key, value, isValuePresent);
  }

  @action
  validateInputEmail(key, value) {
    this._executeFieldValidation(key, value, isEmailValid);
  }

  @action
  validateInputPassword(key, value) {
    this._executeFieldValidation(key, value, isPasswordValid);
  }

  _updateInputsStatus() {
    const errors = this.get('user.errors');
    errors.forEach(({ attribute, message }) => {
      const messageObject = 'validation.' + attribute + '.message';
      this.set(messageObject, message);
    });
  }

  _executeFieldValidation(key, value, isValid) {
    const isInvalidInput = !isValid(value);
    const message = isInvalidInput ? ERROR_INPUT_MESSAGE_MAP[key] : null;
    const messageObject = 'validation.' + key + '.message';
    this.set(messageObject, message);
  }

  _acceptOrganizationInvitation(organizationInvitationId, organizationInvitationCode, createdUserEmail) {
    const status = 'accepted';
    return this.store.createRecord('organization-invitation-response', {
      id: organizationInvitationId + '_' + organizationInvitationCode,
      code: organizationInvitationCode,
      status,
      email: createdUserEmail,
    }).save({ adapterOptions: { organizationInvitationId } });
  }

  _authenticate(email, password) {
    const scope = 'pix-orga';
    return this.session.authenticate('authenticator:oauth2', email, password, scope);
  }
}
