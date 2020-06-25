import _ from 'lodash';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ENV from 'mon-pix/config/environment';

export default class SigninForm extends Component {

  @service url;
  @service intl;
  @tracked hasFailed = false;
  @tracked errorMessage;

  username = '';
  password = '';

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  async signin(event) {
    event && event.preventDefault();
    this.hasFailed = false;
    try {
      await this.args.authenticateUser(this.username, this.password);
    } catch (response) {
      const error = _.get(response, 'errors[0]');
      const isPasswordExpiredError = (_.get(error, 'title') === 'PasswordShouldChange');
      if (isPasswordExpiredError) {
        await this.args.updateExpiredPassword(this.username, this.password);
      } else {
        this._manageErrorsApi(error);
      }

      this.hasFailed = true;
    }
  }

  _manageErrorsApi(firstError) {
    const statusCode = _.get(firstError, 'status');
    this.errorMessage = this._showErrorMessages(statusCode);
  }

  _showErrorMessages(statusCode) {
    const httpStatusCodeMessages = {
      '400': ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.MESSAGE,
      '401': ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.MESSAGE,
      '500': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '502': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
      '504': ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.MESSAGE,
      'default': ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.MESSAGE,
    };
    return this.intl.t(httpStatusCodeMessages[statusCode] || httpStatusCodeMessages['default']);
  }

}
