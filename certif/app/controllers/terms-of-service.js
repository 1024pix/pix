import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class TermsOfServiceController extends Controller {
  @service currentUser;
  @service notifications;
  @service router;
  @service intl;

  @tracked isEnglishLocale = this.intl.primaryLocale === 'en';

  @action
  async submit() {
    try {
      await this.currentUser.certificationPointOfContact.save({
        adapterOptions: { acceptPixCertifTermsOfService: true },
      });
      this.currentUser.certificationPointOfContact.pixCertifTermsOfServiceAccepted = true;
      this.router.transitionTo('authenticated.sessions.list');
    } catch (errorResponse) {
      this.notifications.error(this.intl.t('common.api-error-messages.internal-server-error'));
    }
  }
}
