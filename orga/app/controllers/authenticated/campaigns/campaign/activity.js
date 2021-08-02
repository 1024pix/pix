import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ActivityController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];
  @tracked pageNumber = 1;
  @tracked pageSize = 25;
  @tracked divisions = [];

  @action
  goToParticipantPage(campaignId, participationId) {
    if (this.model.campaign.isTypeAssessment) {
      this.transitionToRoute('authenticated.campaigns.participant-assessment', campaignId, participationId);
    } else {
      this.transitionToRoute('authenticated.campaigns.participant-profile', campaignId, participationId);
    }
  }

  @action
  triggerFiltering(filters) {
    this.pageNumber = null;
    this.divisions = filters.divisions;
  }

  @action
  resetFiltering() {
    this.pageNumber = null;
    this.divisions = [];
  }
}
