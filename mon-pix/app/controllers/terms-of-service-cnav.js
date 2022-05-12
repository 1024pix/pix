import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

const ERROR_INPUT_MESSAGE_MAP = {
  termsOfServiceNotSelected: 'pages.terms-of-service-cnav.form.error-message',
  unknowError: 'common.error',
  expiredAuthenticationKey: 'pages.terms-of-service-cnav.form.expired-authentication-key',
};

export default class TermsOfServiceCnavController extends Controller {
  queryParams = ['authenticationKey'];

  @service session;
  @service store;
  @service url;
  @service intl;

  @tracked authenticationKey = null;
  @tracked isTermsOfServiceValidated = false;
  @tracked errorMessage = null;

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  async submit() {
    if (this.isTermsOfServiceValidated) {
      this.errorMessage = false;
      try {
        await this.session.authenticate('authenticator:cnav', { authenticationKey: this.authenticationKey });
      } catch (error) {
        const status = get(error, 'errors[0].status');
        if (status === '401') {
          this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['expiredAuthenticationKey']);
        } else {
          this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['unknowError']);
        }
      }
    } else {
      this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['termsOfServiceNotSelected']);
    }
  }
}
