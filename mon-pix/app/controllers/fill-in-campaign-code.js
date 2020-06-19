import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class FillInCampaignCodeController extends Controller {
  @service store;

  campaignCode = null;

  @tracked
  errorMessage = null;

  @action
  async startCampaign() {
    this.clearErrorMessage();

    if (!this.campaignCode) {
      this.errorMessage = 'Veuillez saisir un code.';
      return;
    }

    const campaignCode = this.campaignCode.toUpperCase();
    try {
      const campaigns = await this.store.query('campaign', { filter: { code: campaignCode } });
      const campaign = campaigns.get('firstObject');
      return this.transitionToRoute('campaigns.start-or-resume', campaign);
    } catch (error) {
      this.onStartCampaignError(error);
    }
  }

  onStartCampaignError(error) {
    const { status } = error.errors[0];
    if (status === '403') {
      this.errorMessage = 'Oups ! nous ne parvenons pas à vous trouver. Vérifiez vos informations afin de continuer ou prévenez l’organisateur.';
    } else if (status === '404') {
      this.errorMessage = 'Votre code est erroné, veuillez vérifier ou contacter l’organisateur.';
    } else {
      throw (error);
    }
  }

  @action
  clearErrorMessage() {
    this.errorMessage = null;
  }
}
