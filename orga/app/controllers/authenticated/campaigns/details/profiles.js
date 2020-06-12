import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ProfilesController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];
  pageNumber = 1;
  pageSize = 10;

  @action
  goToProfilePage(campaignId, campaignParticipationId) {
    this.transitionToRoute('authenticated.campaigns.profile', campaignId, campaignParticipationId);
  }
}
