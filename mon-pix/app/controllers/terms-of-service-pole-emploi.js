import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TermsOfServicePoleEmploiController extends Controller {
  queryParams = ['authenticationKey'];

  @service session;
  @tracked authenticationKey = null;

  @action
  async createSession() {
    await this.session.authenticate('authenticator:pole-emploi', { authenticationKey: this.authenticationKey });
  }
}
