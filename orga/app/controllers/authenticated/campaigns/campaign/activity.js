import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ActivityController extends Controller {
  @service router;
  @service notifications;
  @service intl;

  queryParams = ['pageNumber', 'pageSize'];
  @tracked pageNumber = 1;
  @tracked pageSize = 25;
  @tracked divisions = [];
  @tracked status = null;
  @tracked groups = [];
  @tracked campaign;
  @tracked participations;

  @action
  goToParticipantPage(campaignId, participationId) {
    if (this.model.campaign.isTypeAssessment) {
      this.router.transitionTo('authenticated.campaigns.participant-assessment', campaignId, participationId);
    } else {
      this.router.transitionTo('authenticated.campaigns.participant-profile', campaignId, participationId);
    }
  }

  @action
  triggerFiltering(filters) {
    this.pageNumber = null;
    this.divisions = filters.divisions || this.divisions;
    this.groups = filters.groups || this.groups;
    if (filters.status !== undefined) {
      this.status = filters.status;
    }
  }

  @action
  resetFiltering() {
    this.pageNumber = null;
    this.divisions = [];
    this.status = null;
    this.groups = [];
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
