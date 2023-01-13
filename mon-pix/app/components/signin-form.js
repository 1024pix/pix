import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ENV from 'mon-pix/config/environment';
import get from 'lodash/get';

export default class SigninForm extends Component {
  @service url;
  @service intl;
  @service featureToggles;
  @service session;
  @service store;
  @service router;

  @tracked hasFailed = false;
  @tracked errorMessage;

  login = '';
  password = '';

  get showcaseUrl() {
    return this.url.showcaseUrl;
  }

  get displayPoleEmploiButton() {
    return this.url.isFrenchDomainExtension;
  }

  @action
  async signin(event) {
    event && event.preventDefault();
    this.hasFailed = false;
    try {
      await this.session.authenticateUser(this.login, this.password);
    } catch (responseError) {
      this.hasFailed = true;
      this._handleApiError(responseError);
    }
  }

  async _handleApiError(responseError) {
    const errors = get(responseError, 'responseJSON.errors');
    const error = Array.isArray(errors) && errors.length > 0 && errors[0];
    switch (error?.code) {
      case 'SHOULD_CHANGE_PASSWORD': {
        const passwordResetToken = error.meta;
        await this._updateExpiredPassword(passwordResetToken);
        break;
      }
      case 'USER_IS_TEMPORARY_BLOCKED':
        this.errorMessage = this.intl.t(ENV.APP.API_ERROR_MESSAGES.USER_IS_TEMPORARY_BLOCKED.I18N_KEY, {
          url: '/mot-de-passe-oublie',
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

  async _updateExpiredPassword(passwordResetToken) {
    this.store.createRecord('reset-expired-password-demand', { passwordResetToken });
    return this.router.replaceWith('update-expired-password');
  }

  _getI18nKeyByStatus(status) {
    switch (status) {
      case 400:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 401:
        return ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.I18N_KEY;
      case 422:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 504:
        return ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY;
      default:
        return ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY;
    }
  }
}
