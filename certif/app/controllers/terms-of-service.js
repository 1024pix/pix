import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class TermsOfServiceController extends Controller {
  @service currentUser;
  @service notifications;
  @service router;

  @action
  async submit() {
    try {
      await this.currentUser.certificationPointOfContact.save({
        adapterOptions: { acceptPixCertifTermsOfService: true },
      });
      this.currentUser.certificationPointOfContact.pixCertifTermsOfServiceAccepted = true;
      this.router.transitionTo('authenticated.sessions.list');
    } catch (errorResponse) {
      this.notifications.error('Une erreur est survenue.');
    }
  }
}
