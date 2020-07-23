import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ProfilesController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];
  @tracked pageNumber = 1;
  @tracked pageSize = 10;

  @action
  goToProfilePage(campaignId, campaignParticipationId) {
    this.transitionToRoute('authenticated.campaigns.profile', campaignId, campaignParticipationId);
  }
}
