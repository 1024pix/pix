import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-certif/config/environment';
import get from 'lodash/get';

export default class LoginForm extends Component {
  @service url;
  @service intl;
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
  setEmail(event) {
    this.email = event.target.value;
  }

  @action
  setPassword(event) {
    this.password = event.target.value;
  }

  @action
  async authenticate(event) {
    event.preventDefault();
    const email = this.email ? this.email.trim() : '';
    const password = this.password;
    const scope = 'pix-certif';
    try {
      await this.session.authenticate('authenticator:oauth2', email, password, scope);
    } catch (responseError) {
      this.isErrorMessagePresent = true;
      this._handleApiError(responseError);
    }
  }

  @action
  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  _handleApiError(responseError) {
    const errors = get(responseError, 'responseJSON.errors');
    const error = Array.isArray(errors) && errors.length > 0 && errors[0];
    switch (error?.code) {
      case 'SHOULD_CHANGE_PASSWORD':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.SHOULD_CHANGE_PASSWORD.I18N_KEY, {
          url: this.url.forgottenPasswordUrl,
          htmlSafe: true,
        });
        break;
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
        return ENV.APP.API_ERROR_MESSAGES.NOT_LINKED_CERTIFICATION.I18N_KEY;
      case 422:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 504:
        return ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY;
      default:
        return ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY;
    }
  }
}
