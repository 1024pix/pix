import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const IDENTITY_PROVIDER_ID_GAR = 'GAR';

export default class FillInCampaignCodeController extends Controller {
  @service currentDomain;
  @service currentUser;
  @service intl;
  @service locale;
  @service router;
  @service session;
  @service store;

  campaignCode = null;

  @tracked errorMessage = null;
  @tracked showGARModal = false;
  @tracked campaign = null;
  @tracked selectedLanguage = this.intl.primaryLocale;

  get isUserAuthenticatedByPix() {
    return this.session.isAuthenticated;
  }

  get isUserAuthenticatedByGAR() {
    return !!this.session.get('data.externalUser');
  }

  get firstTitle() {
    return this.isUserAuthenticatedByPix && !this.currentUser.user.isAnonymous
      ? this.intl.t('pages.fill-in-campaign-code.first-title-connected', { firstName: this.currentUser.user.firstName })
      : this.intl.t('pages.fill-in-campaign-code.first-title-not-connected');
  }

  get warningMessage() {
    return this.intl.t('pages.fill-in-campaign-code.warning-message', {
      firstName: this.currentUser.user.firstName,
      lastName: this.currentUser.user.lastName,
    });
  }

  get showWarningMessage() {
    return this.isUserAuthenticatedByPix && !this.currentUser.user.isAnonymous;
  }

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  get isUserNotAuthenticated() {
    return !this.isUserAuthenticatedByPix && !this.isUserAuthenticatedByGAR;
  }

  get canDisplayLanguageSwitcher() {
    return this.isInternationalDomain && this.isUserNotAuthenticated;
  }

  @action
  async startCampaign(event) {
    event.preventDefault();
    this.clearErrorMessage();

    if (!this.campaignCode) {
      this.errorMessage = this.intl.t('pages.fill-in-campaign-code.errors.missing-code');
      return;
    }

    const campaignCode = this.campaignCode.toUpperCase();
    try {
      this.campaign = await this.store.queryRecord('campaign', {
        filter: { code: campaignCode },
      });
      const isGARCampaign = this.campaign.identityProvider === IDENTITY_PROVIDER_ID_GAR;
      const isUserAuthenticatedByGAR = this.session.get('data.externalUser');
      if (_shouldShowGARModal(isGARCampaign, isUserAuthenticatedByGAR, this.isUserAuthenticatedByPix)) {
        this.showGARModal = true;
        return;
      }

      this.router.transitionTo('campaigns.entry-point', this.campaign.code);
    } catch (error) {
      this.onStartCampaignError(error);
    }
  }

  onStartCampaignError(error) {
    const { status } = error.errors[0];
    if (status === '403') {
      this.errorMessage = this.intl.t('pages.fill-in-campaign-code.errors.forbidden');
    } else if (status === '404') {
      this.errorMessage = this.intl.t('pages.fill-in-campaign-code.errors.not-found');
    } else {
      throw error;
    }
  }

  @action
  clearErrorMessage() {
    this.errorMessage = null;
  }

  @action
  disconnect() {
    this.session.invalidate();
  }

  @action
  closeModal() {
    this.showGARModal = false;
  }

  @action
  navigateToCampaignEntryPoint() {
    this.closeModal();
    this.router.transitionTo('campaigns.entry-point', this.campaign.code);
  }

  @action
  onLanguageChange(language) {
    this.selectedLanguage = language;
    this.locale.setLocale(this.selectedLanguage);
    this.router.replaceWith('fill-in-campaign-code', { queryParams: { lang: null } });
  }
}

function _shouldShowGARModal(isGARCampaign, isUserAuthenticatedByGAR, isUserAuthenticatedByPix) {
  if (!isGARCampaign) {
    return false;
  }

  if (isUserAuthenticatedByGAR) {
    return false;
  }

  if (isUserAuthenticatedByPix) {
    return false;
  }

  return true;
}
