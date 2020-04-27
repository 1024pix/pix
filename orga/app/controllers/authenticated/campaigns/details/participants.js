import { action } from '@ember/object';
import Controller from '@ember/controller';

export default class ParticipantsController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];
  pageNumber = 1;
  pageSize = 10;

  @action
  goToParticipantPage(campaignId, participantId) {
    this.transitionToRoute('authenticated.campaigns.participant.results', campaignId, participantId);
  }
}
