import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SendProfileController extends Controller {

  @tracked isLoading = false;
  @tracked errorMessage = null;

  @action
  async sendProfile() {
    this.errorMessage = null;
    this.isLoading = true;

    const campaignParticipation = this.model.campaignParticipation;
    campaignParticipation.isShared = true;

    try {
      await campaignParticipation.save();
    } catch (error) {
      campaignParticipation.rollbackAttributes();
      this.errorMessage = true;
    }
    this.isLoading = false;
  }
}
