import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class TermOfServiceController extends Controller {

  @service currentUser;
  @service store;

  @action
  async submit() {
    await this.currentUser.user.save({ adapterOptions: { acceptPixOrgaTermsOfService: true } });
    this.transitionToRoute('application');
  }
}
