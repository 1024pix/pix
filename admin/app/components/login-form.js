import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { HttpStatusCodes } from '../http-status-code';

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
        this._manageErrorsApis(response);
      });
    }
  },

  _manageErrorsApis: function(response) {

    if (response && response.errors && response.errors.length > 0) {
      const firstError = response.errors[0];
      switch (firstError.status) {

        case HttpStatusCodes.BAD_REQUEST.CODE:
          this.set('errorMessage', HttpStatusCodes.BAD_REQUEST.MESSAGE);
          break;
        case HttpStatusCodes.INTERNAL_SERVER_ERROR.CODE:
          this.set('errorMessage', HttpStatusCodes.INTERNAL_SERVER_ERROR.MESSAGE);
          break;
        case HttpStatusCodes.FORBIDDEN:
          this.set('errorMessage', firstError.detail);
          break;
        case HttpStatusCodes.UNAUTHORIZED.CODE :
          this.set('errorMessage', firstError.detail);
          break;
      }
    }
    else {
      this.set('errorMessage', HttpStatusCodes.INTERNAL_SERVER_ERROR.MESSAGE);
    }
  }

});
