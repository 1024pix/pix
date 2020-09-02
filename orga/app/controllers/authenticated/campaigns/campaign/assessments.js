import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AssessmentsController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];
  @tracked pageNumber = 1;
  @tracked pageSize = 10;

  @action
  goToAssessmentPage(campaignId, participantId) {
    this.transitionToRoute('authenticated.campaigns.assessment', campaignId, participantId);
  }
}
