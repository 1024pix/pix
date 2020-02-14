import Component from '@ember/component';
import { inject as service } from '@ember/service';
import ENV from 'pix-admin/config/environment';

export default Component.extend({

  // dependencies
  session: service(),

  // properties
  identification: null,
  password: null,
  errorMessage: null,

  // interactions
  actions: {
    authenticateUser() {
      const scope = 'pix-admin';
      const { identification, password } = this;
      this.session.authenticate('authenticator:oauth2', identification, password, scope).catch((response) => {
        this._manageErrorsApi(response);
      });
    }
  },

  _manageErrorsApi: function(response) {

    if (response && response.errors && response.errors.length > 0) {
      const firstError = response.errors[0];
      const messageError = this._showErrorMessages(firstError.status, firstError.detail);
      this.set('errorMessage', messageError);
    } else {
      this.set('errorMessage', ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE);
    }
  }
  ,

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

});
