import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

const ERROR_INPUT_MESSAGE_MAP = {
  termsOfServiceNotSelected: 'pages.terms-of-service-pole-emploi.form.error-message',
  unknownError: 'common.error',
  expiredAuthenticationKey: 'pages.terms-of-service-pole-emploi.form.expired-authentication-key',
};

export default class TermsOfServicePoleEmploiComponent extends Component {
  @service url;
  @service intl;

  @tracked isTermsOfServiceValidated = false;
  @tracked isAuthenticationKeyExpired = false;
  @tracked errorMessage = null;

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  async submit() {
    if (this.isTermsOfServiceValidated) {
      this.errorMessage = null;
      try {
        await this.args.createSession();
      } catch (error) {
        const status = get(error, 'errors[0].status');
        if (status === '401') {
          this.isAuthenticationKeyExpired = true;
          this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['expiredAuthenticationKey']);
        } else {
          this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['unknownError']);
        }
      }
    } else {
      this.errorMessage = this.intl.t(ERROR_INPUT_MESSAGE_MAP['termsOfServiceNotSelected']);
    }
  }
}
