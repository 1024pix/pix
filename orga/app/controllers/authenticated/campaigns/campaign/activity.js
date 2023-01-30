import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ActivityController extends Controller {
  @service router;
  @service notifications;
  @service intl;

  @tracked pageNumber = 1;
  @tracked pageSize = 50;
  @tracked divisions = [];
  @tracked status = null;
  @tracked groups = [];
  @tracked campaign;
  @tracked participations;
  @tracked search = null;

  @action
  goToParticipantPage(campaignId, participationId) {
    if (this.model.campaign.isTypeAssessment) {
      this.router.transitionTo('authenticated.campaigns.participant-assessment', campaignId, participationId);
    } else {
      this.router.transitionTo('authenticated.campaigns.participant-profile', campaignId, participationId);
    }
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
  async deleteCampaignParticipant(campaignId, campaignParticipantActivity) {
    try {
      await campaignParticipantActivity.destroyRecord({
        adapterOptions: { campaignId, campaignParticipationId: campaignParticipantActivity.id },
      });
      this.send('refreshModel');
      this.notifications.success(this.intl.t('pages.campaign-activity.delete-participation-modal.success'));
    } catch (error) {
      this.notifications.error(this.intl.t('pages.campaign-activity.delete-participation-modal.error'));
    }
  }
}
