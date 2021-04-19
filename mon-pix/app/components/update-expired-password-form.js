/* eslint ember/no-classic-components: 0 */
/* eslint ember/require-tagless-components: 0 */

import { action } from '@ember/object';
import Component from '@ember/component';
import { inject as service } from '@ember/service';
import isPasswordValid from '../utils/password-validator';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';

const SCOPE_MON_PIX = 'mon-pix';
const ERROR_PASSWORD_MESSAGE = 'pages.update-expired-password.fields.error';
const AUTHENTICATED_SOURCE_FROM_MEDIACENTRE = ENV.APP.AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;

const VALIDATION_MAP = {
  default: {
    status: 'default', message: null,
  },
  error: {
    status: 'error', message: ERROR_PASSWORD_MESSAGE,
  },
};

export default class UpdateExpiredPasswordForm extends Component {

  @service intl;
  @service session;
  @service url;

  @tracked validation = VALIDATION_MAP.default;
  @tracked newPassword = null;
  @tracked isLoading = false;
  @tracked authenticationHasFailed = null;

  @tracked errorMessage = null;

  get homeUrl() {
    return this.url.homeUrl;
  }

  get validationMessage() {
    if (this.validation.message) {
      return this.intl.t(this.validation.message);
    }
    return null;
  }

  @action
  validatePassword() {
    this.errorMessage = null;
    const validationStatus = (isPasswordValid(this.newPassword)) ? 'default' : 'error';
    this.validation = VALIDATION_MAP[validationStatus];
  }

  @action
  async handleUpdatePasswordAndAuthenticate(event) {
    event && event.preventDefault();

    this.validatePassword();

    if (!this.validation.message) {
      this.isLoading = true;
      this.authenticationHasFailed = false;
      this.validation = VALIDATION_MAP.default;

      try {

        this.resetExpiredPasswordDemand.newPassword = this.newPassword;
        await this.resetExpiredPasswordDemand.save();
        this.resetExpiredPasswordDemand.unloadRecord();

        await this._authenticateWithUpdatedPassword({ login: this.resetExpiredPasswordDemand.username, password: this.newPassword });

        if (this.session.get('data.externalUser')) {
          this.session.data.authenticated.source = AUTHENTICATED_SOURCE_FROM_MEDIACENTRE;
        }
      } catch (errorResponse) {
        const error = get(errorResponse, 'errors[0]');
        this._manageErrorsApi(error);
      } finally {
        this.isLoading = false;
      }
    }
  }

  async _authenticateWithUpdatedPassword({ login, password }) {
    try {
      await this.session.authenticate('authenticator:oauth2', {
        login, password, scope: SCOPE_MON_PIX,
      });
      this.session.set('data.externalUser', null);
      this.session.set('data.expectedUserId', null);
    } catch (errorResponse) {
      this.authenticationHasFailed = true;
    }
  }

  _manageErrorsApi(error) {
    const statusCode = get(error, 'status');
    if (statusCode === '400') {
      this.validation = VALIDATION_MAP.error;
    } else {
      this.errorMessage = this._showErrorMessages(statusCode);
    }
  }

  _showErrorMessages(statusCode) {
    const httpStatusCodeMessages = {
      '401': ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.MESSAGE,
      'default': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
    };
    return this.intl.t(httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
  }
}
