import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ActivityController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];
  @tracked pageNumber = 1;
  @tracked pageSize = 25;

  @action
  goToParticipantPage(campaignId, participationId) {
    if (this.model.campaign.isTypeAssessment) {
      this.transitionToRoute('authenticated.campaigns.assessment', campaignId, participationId);
    } else {
      this.transitionToRoute('authenticated.campaigns.profile', campaignId, participationId);
    }
  }
}
