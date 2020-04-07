import { action } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import isPasswordValid from '../utils/password-validator';
import ENV from 'mon-pix/config/environment';
import { tracked } from '@glimmer/tracking';

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

export default class UpdateExpiredPasswordForm extends Component {
  @service session;

  @tracked validation = VALIDATION_MAP['default'];
  @tracked newPassword = null;
  @tracked isLoading = false;
  @tracked authenticationHasFailed = null;

  @tracked errorMessage = null;

  urlHome = ENV.APP.HOME_HOST;

  @action
  validatePassword() {
    const validationStatus = (isPasswordValid(this.newPassword)) ? 'default' : 'error';
    this.validation = VALIDATION_MAP[validationStatus];
  }

  @action
  async handleUpdatePasswordAndAuthenticate() {
    this.isLoading = true;
    this.authenticationHasFailed = false;
    try {
      await this.user.save({ adapterOptions: { updateExpiredPassword: true, newPassword: this.newPassword } });
      this.validation = SUBMISSION_MAP['default'];
      await this.user.unloadRecord();
      await this._authenticateWithUpdatedPassword({ login: this.user.username, password: this.newPassword });
    } catch (err) {
      this.validation = SUBMISSION_MAP['error'];
    } finally {
      this.isLoading = false;
    }
  }

  async _authenticateWithUpdatedPassword({ login, password }) {
    const scope = 'mon-pix';
    try {
      await this.session.authenticate('authenticator:oauth2', { login, password,  scope });
    } catch (response) {
      this.authenticationHasFailed = true;
    }
  }
}
