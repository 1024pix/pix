import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SendProfileController extends Controller {

  @tracked isLoading = false;
  @tracked errorMessage = null;
  pageTitle = 'Envoyer mon profil';

  @action
  async sendProfile() {
    this.errorMessage = null;
    this.isLoading = true;

    const campaignParticipation = this.model.campaignParticipation;
    campaignParticipation.isShared = true;

    try {
      await campaignParticipation.save();
    } catch (errorResponse) {
      campaignParticipation.rollbackAttributes();
      this._handleCampaignParticipationSaveErrors(errorResponse.errors);
    }
    this.isLoading = false;
  }

  _handleCampaignParticipationSaveErrors(errors) {
    if (errors && errors.length > 0) {
      errors.forEach((error) => {
        if (error.status === '412') {
          this.errorMessage = 'L’envoi de votre profil n’est plus possible car l’organisateur a archivé la collecte de profils.';
        }
      });
    }
  }
}
