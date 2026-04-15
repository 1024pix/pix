import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ActivityController extends Controller {
  @service currentUser;
  @service intl;
  @service pixToast;
  @service router;

  @tracked pageNumber = 1;
  @tracked pageSize = 50;
  @tracked divisions = [];
  @tracked status = null;
  @tracked groups = [];
  @tracked campaign;
  @tracked participations;
  @tracked search = null;

  get isGarAuthenticationMethod() {
    return this.currentUser.isGarAuthenticationMethod;
  }

  @action
  goToParticipantPage(participant) {
    const route =
      this.model.campaign.isTypeAssessment || this.model.campaign.isTypeExam
        ? 'authenticated.campaigns.participant-assessment'
        : 'authenticated.campaigns.participant-profile';

    this.router.transitionTo(route, this.model.campaign.id, participant.lastCampaignParticipationId);
  }

  @action
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = null;
  }

  @action
  resetFiltering() {
    this.pageNumber = null;
    this.divisions = [];
    this.status = null;
    this.groups = [];
    this.search = null;
  }

  @action
  async deleteCampaignParticipation(campaignId, campaignParticipantActivity) {
    try {
      await campaignParticipantActivity.destroyRecord({
        adapterOptions: {
          campaignId,
          campaignParticipationId: campaignParticipantActivity.lastCampaignParticipationId,
        },
      });
      this.send('refreshModel');
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.campaign-activity.delete-participation-modal.success'),
      });
    } catch {
      this.notifications.sendError(this.intl.t('pages.campaign-activity.delete-participation-modal.error'));
    }
  }
}
