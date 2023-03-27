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
  @tracked password = null;
  @tracked login = null;

  get showcase() {
    return this.url.showcase;
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

  @action
  updateLogin(event) {
    this.login = event.target.value?.trim();
  }

  @action
  updatePassword(event) {
    this.password = event.target.value?.trim();
  }

  async _handleApiError(responseError) {
    const errors = get(responseError, 'responseJSON.errors');
    const error = Array.isArray(errors) && errors.length > 0 && errors[0];
    switch (error?.code) {
      case 'INVALID_LOCALE_FORMAT':
        this.errorMessage = this.intl.t('pages.sign-up.errors.invalid-locale-format', {
          invalidLocale: error.meta.locale,
        });
        break;
      case 'LOCALE_NOT_SUPPORTED':
        this.errorMessage = this.intl.t('pages.sign-up.errors.locale-not-supported', {
          localeNotSupported: error.meta.locale,
        });
        break;
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
