import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import ENV from 'mon-pix/config/environment';
import isPasswordValid from '../utils/password-validator';

const ERROR_PASSWORD_MESSAGE = 'Votre mot de passe doit contenir 8 caractères au minimum et comporter au moins une majuscule, une minuscule et un chiffre.';

const VALIDATION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  }
};

const SUBMISSION_MAP = {
  default: {
    status: 'default', message: null
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE
  }
};

export default class UpdateExpiredPassword extends Controller {

  @service session;

  urlHome = ENV.APP.HOME_HOST;
  pageTitle = 'Changer mon mot de passe';

  @tracked validation = VALIDATION_MAP['default'];
  @tracked newPassword = null;
  @tracked isLoading = false;
  @tracked displaySuccessMessage = null;

  @action
  validatePassword() {
    const validationStatus = (isPasswordValid(this.newPassword)) ? 'default' : 'error';
    this.validation = VALIDATION_MAP[validationStatus];
  }

  @action
  async handleUpdatePassword() {
    this.isLoading = true;
    this.displaySuccessMessage = false;

    try {
      await this.model.save({ adapterOptions: { updateExpiredPassword: true, newPassword: this.newPassword } });
      this.validation = SUBMISSION_MAP['default'];
      this.displaySuccessMessage = true;
      return this._authenticateWithUpdatedPassword({ login: this.model.username, password: this.newPassword });
    } catch (err) {
      this.validation = SUBMISSION_MAP['error'];
    } finally {
      this.set('isLoading', false);
    }

  }

  _authenticateWithUpdatedPassword({ login, password }) {
    const scope = 'mon-pix';
    try {
      return this.session.authenticate('authenticator:oauth2', { login, password,  scope });
    } catch (response) {
      return this._manageErrorsApi(response);
    }
  }

}
