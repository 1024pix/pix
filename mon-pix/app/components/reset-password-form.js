import Component from '@ember/component';
import isPasswordValid from '../utils/password-validator';
import ENV from 'mon-pix/config/environment';

const VALIDATION_MAP = {
  default: {
    status: 'default',
    message: null,
  },
  error: {
    status: 'error',
    message: 'Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.',
  },
};

export default Component.extend({
  displaySuccessMessage: false,
  validation: VALIDATION_MAP.default,
  errorMessage: null,
  urlHome: ENV.APP.HOME_HOST,

  actions: {
    validatePassword() {
      const password = this.passwordReset.password;
      const status = isPasswordValid(password) ? 'default' : 'error';

      this.set('validation', VALIDATION_MAP[status]);
    },

    handleResetPassword() {
      this.set('displaySuccessMessage', false);
      this.set('errorMessage', null);

      return this.passwordReset.save()
        .then(() => {
          this.set('validation', VALIDATION_MAP.default);
          this.set('displaySuccessMessage', true);
        })
        .catch((data) => {
          const error = data.errors[0];

          // Password validation error
          if (error.status === '422') {
            return this.set('validation', {
              status: 'error',
              message: error.detail,
            });
          }

          // Token validation error
          this.set('errorMessage', 'Le lien que vous venez d\'utiliser n\'est plus valide. Merci de refaire une demande de réinitialisation de mot de passe.');
        });
    }
  }
});
