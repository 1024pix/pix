import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class FillInCampaignCodeController extends Controller {

  @service store;
  @service intl;
  @service session;
  @service currentUser;

  campaignCode = null;

  @tracked errorMessage = null;

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
      this.errorMessage = this.intl.t(
        'pages.fill-in-campaign-code.errors.missing-code',
      );
      return;
    }

    const campaignCode = this.campaignCode.toUpperCase();
    try {
      const campaign = await this.store.queryRecord('campaign', {
        filter: { code: campaignCode },
      });
      return this.transitionToRoute('campaigns.start-or-resume', campaign);
    } catch (error) {
      this.onStartCampaignError(error);
    }
  }

  onStartCampaignError(error) {
    const { status } = error.errors[0];
    if (status === '403') {
      this.errorMessage = this.intl.t(
        'pages.fill-in-campaign-code.errors.forbidden',
      );
    } else if (status === '404') {
      this.errorMessage = this.intl.t(
        'pages.fill-in-campaign-code.errors.not-found',
      );
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
}
