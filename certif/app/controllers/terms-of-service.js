import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TermsOfServiceController extends Controller {
  @service currentUser;
  @service notifications;
  @service router;
  @service intl;

  @tracked isEnglishLocale = this.intl.t('current-lang') === 'en';

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
