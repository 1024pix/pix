import get from 'lodash/get';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ENV from 'mon-pix/config/environment';

export default class SigninForm extends Component {

  @service url;
  @service intl;
  @service featureToggles;

  @tracked hasFailed = false;
  @tracked errorMessage;

  username = '';
  password = '';

  get homeUrl() {
    return this.url.homeUrl;
  }

  get displayPoleEmploiButton() {
    return this.url.isFrenchDomainExtension && this.featureToggles.featureToggles.isPoleEmploiEnabled;
  }

  @action
  async signin(event) {
    event && event.preventDefault();
    this.hasFailed = false;
    try {
      await this.args.authenticateUser(this.username, this.password);
    } catch (response) {
      const shouldChangePassword = get(response, 'responseJSON.errors[0].title') === 'PasswordShouldChange';
      if (shouldChangePassword) {
        await this.args.updateExpiredPassword(this.username, this.password);
      } else {
        this.errorMessage = this._findErrorMessage(response.status);
      }
      this.hasFailed = true;
    }
  }

  _findErrorMessage(statusCode) {
    const httpStatusCodeMessages = {
      '400': ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE,
      '401': ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.MESSAGE,
      'default': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
    };
    return this.intl.t(httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
  }

}
