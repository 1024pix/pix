/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import { action } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import isPasswordValid from '../utils/password-validator';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';

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
  @service intl;
  @service session;
  @service url;

  @tracked validation = VALIDATION_MAP['default'];
  @tracked newPassword = null;
  @tracked isLoading = false;
  @tracked authenticationHasFailed = null;

  @tracked errorMessage = null;

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  validatePassword() {
    const validationStatus = (isPasswordValid(this.newPassword)) ? 'default' : 'error';
    this.validation = VALIDATION_MAP[validationStatus];
  }

  @action
  async handleUpdatePasswordAndAuthenticate(event) {
    event && event.preventDefault();

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
    } catch (errorResponse) {
      const error = get(errorResponse, 'errors[0]');
      this._manageErrorsApi(error);
    }
  }

  _manageErrorsApi(error) {
    const statusCode = get(error, 'status');
    this.errorMessage = this._showErrorMessages(statusCode);
  }

  _showErrorMessages(statusCode) {
    const httpStatusCodeMessages = {
      '400': ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE,
      '401': this.authenticationHasFailed = true,
      '500': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '502': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '504': ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.MESSAGE,
      'default': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
    };
    return this.intl.t(httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
  }
}
