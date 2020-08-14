import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SendProfileController extends Controller {
  @service intl;

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
          this.errorMessage = this.intl.t('pages.send-profile.errors.archived');
        }
      });
    }
  }
}
