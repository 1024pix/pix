import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TermsOfServiceNeoController extends Controller {
  queryParams = ['authenticationKey'];

  @service session;
  @service store;
  @service url;

  @tracked authenticationKey = null;
  @tracked isTermsOfServiceValidated = false;
  @tracked showErrorTermsOfServiceNotSelected = false;
  @tracked showErrorTermsOfServiceExpiredAuthenticatedKey = false;

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  async submit() {
    if (this.isTermsOfServiceValidated) {
      this.showErrorTermsOfServiceNotSelected = false;
      try {
        await this.session.authenticate('authenticator:neo', { authenticationKey: this.authenticationKey });
      } catch (error) {
        this.showErrorTermsOfServiceExpiredAuthenticatedKey = true;
      }
    } else {
      this.showErrorTermsOfServiceNotSelected = true;
    }
  }
}
