import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SendProfileController extends Controller {
  @service intl;
  @service currentUser;

  @tracked errorMessage = null;

  get isDisabled() {
    return Boolean(this.model.campaignParticipation?.deletedAt) || this.model.campaign.isArchived;
  }

  @action
  async sendProfile(event) {
    event.preventDefault();
    this.errorMessage = null;

    const campaignParticipation = this.model.campaignParticipation;
    campaignParticipation.isShared = true;

    try {
      await campaignParticipation.save();
      await this.currentUser.load();
    } catch (errorResponse) {
      campaignParticipation.rollbackAttributes();
      this._handleCampaignParticipationSaveErrors(errorResponse.errors);
    }
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
