import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-certif/config/environment';
import _ from 'lodash';

export default class LoginForm extends Component {

  @service session;

  email = null;
  password = null;
  @tracked isPasswordVisible = false;
  @tracked isErrorMessagePresent = false;
  @tracked errorMessage = null;

  get passwordInputType() {
    return this.isPasswordVisible ? 'text' : 'password';
  }

  @action
  async authenticate(event) {
    event.preventDefault();
    const email = this.email ? this.email.trim() : '';
    const password = this.password;
    const scope = 'pix-certif';
    try {
      await this.session.authenticate('authenticator:oauth2', email, password, scope);
    } catch (response) {
      this.isErrorMessagePresent = true;
      this._manageErrorsApi(response);
    }
  }

  @action
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  _manageErrorsApi(response = {}) {

    const nbErrors = _.get(response, 'responseJSON.errors.length', 0);

    if (nbErrors > 0) {
      const firstError = response.responseJSON.errors[0];
      const messageError = this._showErrorMessages(firstError.status, firstError.detail);
      this.errorMessage = messageError;
    } else {
      this.errorMessage = ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE;
    }
  }

  _showErrorMessages(statusCode,apiError) {
    const httpStatusCodeMessages = {

      '400': ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE,
      '500': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '422': ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE,
      '502': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '504': ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.MESSAGE,
      '401': apiError,
      '403': apiError,
      'default': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,

    };
    return (httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
  }
}
