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
    return campaignParticipation.save()
      .then(() => {
        this.isLoading = false;
      })
      .catch(() => {
        campaignParticipation.rollbackAttributes();
        this.isLoading = false;
        this.errorMessage = true;
      });
  }
}
