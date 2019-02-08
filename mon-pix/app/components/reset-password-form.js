import Component from '@ember/component';
import isPasswordValid from '../utils/password-validator';
import ENV from 'mon-pix/config/environment';

const ERROR_PASSWORD_MESSAGE = 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.';
const PASSWORD_SUCCESS_MESSAGE = 'Votre mot de passe a bien été mis à jour';
const VALIDATION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  },
  success: {
    status: 'success', message: ''
  }
};

const SUBMISSION_MAP = {
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  },
  success: {
    status: 'success', message: PASSWORD_SUCCESS_MESSAGE
  }
};

export default Component.extend({
  validation: VALIDATION_MAP['default'],
  urlHome: ENV.APP.HOME_HOST,

  actions: {
    validatePassword() {
      const password = this.get('user.password');
      const validationStatus = (isPasswordValid(password)) ? 'success' : 'error';
      this.set('validation', VALIDATION_MAP[validationStatus]);
    },

    handleResetPassword() {
      return this.get('user').save()
        .then(() => {
          this.set('validation', SUBMISSION_MAP['success']);
          this.set('user.password', null);
        })
        .catch(() => this.set('validation', SUBMISSION_MAP['error']));
    }
  }
});
