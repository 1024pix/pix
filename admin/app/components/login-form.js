import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';
import { tracked } from '@glimmer/tracking';

export default class LoginForm extends Component {

  @service session;

  @tracked email;
  @tracked password;
  @tracked errorMessage;

  @action
  async authenticateUser(event) {
    event.preventDefault();
    const identification = this.email ? this.email.trim() : '';
    const password = this.password;
    const scope = 'pix-admin';
    try {
      await this.session.authenticate('authenticator:oauth2', identification, password, scope);
    } catch (response) {
      this._manageErrorsApi(response);
    }
  }

  _manageErrorsApi(response) {
    const { responseJSON } = response || {};
    if (responseJSON && responseJSON.errors && responseJSON.errors.length > 0) {
      const firstError = responseJSON.errors[0];
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
