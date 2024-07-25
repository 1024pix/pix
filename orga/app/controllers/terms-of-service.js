import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const DUTCH_LOCALE = 'nl';
const ENGLISH_LOCALE = 'en';

export default class TermOfServiceController extends Controller {
  @service currentUser;
  @service intl;
  @service router;

  @tracked isDutchLocale = this.intl.primaryLocale === DUTCH_LOCALE;
  @tracked isEnglishLocale = this.intl.primaryLocale === ENGLISH_LOCALE;

  @action
  async submit() {
    await this.currentUser.prescriber.save({ adapterOptions: { acceptPixOrgaTermsOfService: true } });
    this.currentUser.prescriber.pixOrgaTermsOfServiceAccepted = true;
    this.router.transitionTo('application');
  }
}
