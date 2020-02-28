import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';

export default class LoginForm extends Component {
  // dependencies
  @service session;

  // properties
  identification = null;
  password = null;
  errorMessage = null;

  @action
  authenticateUser() {
    const scope = 'pix-admin';
    const { identification, password } = this;
    this.session.authenticate('authenticator:oauth2', identification, password, scope).catch((response) => {
      this._manageErrorsApi(response);
    });
  }

  _manageErrorsApi(response) {

    if (response && response.errors && response.errors.length > 0) {
      const firstError = response.errors[0];
      const messageError = this._showErrorMessages(firstError.status, firstError.detail);
      this.set('errorMessage', messageError);
    } else {
      this.set('errorMessage', ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE);
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
