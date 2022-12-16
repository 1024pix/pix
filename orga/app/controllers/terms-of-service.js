import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const ENGLISH_LOCALE = 'en';

export default class TermOfServiceController extends Controller {
  @service currentUser;
  @service intl;

  @tracked isEnglishLocale = this.intl.primaryLocale === ENGLISH_LOCALE;

  @action
  async submit() {
    await this.currentUser.prescriber.save({ adapterOptions: { acceptPixOrgaTermsOfService: true } });
    this.currentUser.prescriber.pixOrgaTermsOfServiceAccepted = true;
    this.transitionToRoute('application');
  }
}
