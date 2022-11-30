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
    } catch (response) {
      const shouldChangePassword = get(response, 'responseJSON.errors[0].title') === 'PasswordShouldChange';
      if (shouldChangePassword) {
        const passwordResetToken = response.responseJSON.errors[0].meta;
        await this._updateExpiredPassword(passwordResetToken);
      } else {
        this.errorMessage = this._findErrorMessage(get(response, 'responseJSON.errors[0].code'), response.status);
      }
      this.hasFailed = true;
    }
  }

  _findErrorMessage(errorCode, statusCode) {
    let httpStatusCodeMessages;

    switch (errorCode) {
      case 'USER_HAS_BEEN_TEMPORARY_BLOCKED':
        return this.intl.t(ENV.APP.API_ERROR_MESSAGES.USER_HAS_BEEN_TEMPORARY_BLOCKED.MESSAGE, {
          url: '/mot-de-passe-oublie',
          htmlSafe: true,
        });
      case 'USER_HAS_BEEN_BLOCKED':
        return this.intl.t(ENV.APP.API_ERROR_MESSAGES.USER_HAS_BEEN_BLOCKED.MESSAGE, {
          url: 'https://support.pix.org/support/tickets/new',
          htmlSafe: true,
        });
      default:
        httpStatusCodeMessages = {
          400: this.intl.t(ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE),
          401: this.intl.t(ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.MESSAGE),
          429: this.intl.t(ENV.APP.API_ERROR_MESSAGES.TOO_MANY_REQUESTS.MESSAGE),
          default: this.intl.t(ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE),
        };
        return httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default'];
    }
  }

  async _updateExpiredPassword(passwordResetToken) {
    this.store.createRecord('reset-expired-password-demand', { passwordResetToken });
    return this.router.replaceWith('update-expired-password');
  }
}
