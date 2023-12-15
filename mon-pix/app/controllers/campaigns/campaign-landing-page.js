import { action } from '@ember/object';
import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CampaignLandingPageController extends Controller {
  @service currentDomain;
  @service intl;
  @service locale;
  @service router;
  @service session;

  @tracked selectedLanguage = this.intl.primaryLocale;

  get shouldDisplayLanguageSwitcher() {
    return this.isInternationalDomain && this.isUserNotAuthenticated;
  }

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  get isUserAuthenticatedByGAR() {
    return !!this.session.get('data.externalUser');
  }

  get isUserAuthenticatedByPix() {
    return this.session.isAuthenticated;
  }

  get isUserNotAuthenticated() {
    return !this.isUserAuthenticatedByPix && !this.isUserAuthenticatedByGAR;
  }

  @action
  onLanguageChange(language) {
    this.selectedLanguage = language;
    this.locale.setLocale(this.selectedLanguage);
    this.router.replaceWith('campaigns.campaign-landing-page', { queryParams: { lang: null } });
  }

  @action
  startCampaignParticipation() {
    this.router.transitionTo('campaigns.access', this.model.code);
  }
}
