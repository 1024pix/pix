import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-certif/config/environment';

export default class LoginForm extends Component {

  @service session;
  @tracked isPasswordVisible;
  @tracked isErrorMessagePresent;

  @tracked errorMessage;

  constructor() {
    super(...arguments);

    this.email = null;
    this.password = null;
    this.isPasswordVisible = false;
    this.isErrorMessagePresent = false;
    this.errorMessage = null;
  }

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

  _manageErrorsApi(response) {

    if (response && response.errors && response.errors.length > 0) {
      const firstError = response.errors[0];
      const messageError = this._showErrorMessages(firstError.status, firstError.detail);
      this.errorMessage = messageError;
    } else {
      this.errorMessage = ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE;
    }
  }

  _showErrorMessages(statusCode, error) {
    const httpStatusCodeMessages = {

      '400': ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE,
      '500': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '422': ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE,
      '502': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '504': ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.MESSAGE,
      '401': error,
      '403': error,
      'default': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,

    };
    return (httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
  }
}
