import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class CollectiveResultsController extends Controller {
  @action
  async goToParticipantsForStage(stageId) {
    this.transitionToRoute(
      'authenticated.campaigns.campaign.assessments',
      { queryParams: { stages: [String(stageId)] } },
    );
  }
}
