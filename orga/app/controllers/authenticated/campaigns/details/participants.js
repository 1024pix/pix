import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ParticipantsController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];
  @tracked pageNumber = 1;
  @tracked pageSize = 10;

  @action
  goToParticipantPage(campaignId, participantId) {
    this.transitionToRoute('authenticated.campaigns.participant.results', campaignId, participantId);
  }
}
