import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TermsOfServicePeController extends Controller {
  queryParams = ['authenticationKey'];

  @service session;
  @service url;

  @tracked authenticationKey = null;
  @tracked isTermsOfServiceValidated = false;
  @tracked showErrorTermsOfServiceNotSelected = false;

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  async submit() {
    if (this.isTermsOfServiceValidated) {
      this.showErrorTermsOfServiceNotSelected = false;

      await this.session.authenticate('authenticator:oidc', { authenticationKey: this.authenticationKey });

    } else {
      this.showErrorTermsOfServiceNotSelected = true;
    }
  }

}

