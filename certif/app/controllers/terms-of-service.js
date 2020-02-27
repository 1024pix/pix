import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class TermsOfServiceController extends Controller {
  @service currentUser;

  @action
  async submit() {
    await this.currentUser.user.save({ adapterOptions: { acceptPixCertifTermsOfService: true } });
    return this.transitionToRoute('authenticated.sessions.list');
  }
}
