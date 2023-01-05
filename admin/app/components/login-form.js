import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pix-admin/config/environment';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

export default class LoginForm extends Component {
  @service url;
  @service intl;
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
    } catch (responseError) {
      this._handleApiError(responseError);
    }
  }

  _handleApiError(responseError) {
    const errors = get(responseError, 'responseJSON.errors');
    const error = Array.isArray(errors) && errors.length > 0 && errors[0];
    switch (error?.code) {
      case 'USER_IS_TEMPORARY_BLOCKED':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.USER_IS_TEMPORARY_BLOCKED.I18N_KEY, {
          url: this.url.forgottenPasswordUrl,
          htmlSafe: true,
        });
        break;
      case 'USER_IS_BLOCKED':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.USER_IS_BLOCKED.I18N_KEY, {
          url: 'https://support.pix.org/support/tickets/new',
          htmlSafe: true,
        });
        break;
      default:
        this.errorMessage = this.intl.t(this._getI18nKeyByStatus(responseError.status));
    }
  }

  _getI18nKeyByStatus(status) {
    switch (status) {
      case 400:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 401:
        return ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.I18N_KEY;
      // TODO: This case should be handled with a specific error code like USER_IS_TEMPORARY_BLOCKED or USER_IS_BLOCKED
      case 403:
        return ENV.APP.API_ERROR_MESSAGES.LOGIN_NO_PERMISSION.I18N_KEY;
      case 422:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 504:
        return ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY;
      default:
        return ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY;
    }
  }
}
