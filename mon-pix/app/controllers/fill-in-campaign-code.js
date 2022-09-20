import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import ENV from 'mon-pix/config/environment';

const AUTHENTICATED_SOURCE_FROM_GAR = ENV.APP.AUTHENTICATED_SOURCE_FROM_GAR;
const IDENTITY_PROVIDER_ID_GAR = 'GAR';

export default class FillInCampaignCodeController extends Controller {
  @service store;
  @service intl;
  @service router;
  @service session;
  @service currentUser;

  campaignCode = null;

  @tracked errorMessage = null;
  @tracked showGARModal = false;
  @tracked campaign = null;

  get isUserAuthenticated() {
    return this.session.isAuthenticated;
  }

  get firstTitle() {
    return this.isUserAuthenticated && !this.currentUser.user.isAnonymous
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
    return this.isUserAuthenticated && !this.currentUser.user.isAnonymous;
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
      const externalUser = this.session.get('data.externalUser');
      const isUserAlreadyAuthenticatedWithGAR =
        this.session.get('data.authenticated.source') === AUTHENTICATED_SOURCE_FROM_GAR;
      const shouldShowGARModal = isGARCampaign && !isUserAlreadyAuthenticatedWithGAR && !externalUser;

      if (shouldShowGARModal) {
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
}
