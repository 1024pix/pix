import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

@classic
export default class FillInCampaignCodeController extends Controller {
  @service store;

  campaignCode = null;
  errorMessage = null;

  @action
  async startCampaign() {
    this.clearErrorMessage();

    if (!this.campaignCode) {
      this.set('errorMessage', 'Veuillez saisir un code.');
      return;
    }
  
    const campaignCode = this.campaignCode.toUpperCase();
    try {
      await this.store.query('campaign', { filter: { code: campaignCode } });
      return this.transitionToRoute('campaigns.start-or-resume', campaignCode);
    } catch (error) {
      this.onStartCampaignError(error);
    }
  }

  onStartCampaignError(error) {
    const { status } = error.errors[0];
    if (status === '403') {
      this.set('errorMessage', 'Oups ! nous ne parvenons pas à vous trouver. Verifiez vos informations afin de continuer ou prévenez l’organisateur.');
    } else if (status === '404') {
      this.set('errorMessage', 'Votre code est erroné, veuillez vérifier ou contacter l\'organisateur.');
    } else {
      throw (error);
    } 
  }

  @action
  clearErrorMessage() {
    this.set('errorMessage', null);
  }
}
