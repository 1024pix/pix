import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AssessmentsController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'divisions'];

  @tracked pageNumber = 1;
  @tracked pageSize = 10;
  @tracked divisions = [];

  @action
  goToAssessmentPage(campaignId, participantId) {
    this.transitionToRoute('authenticated.campaigns.assessment', campaignId, participantId);
  }

  @action
  triggerFiltering(filters) {
    this.pageNumber = null;
    this.divisions = filters.divisions;
  }
}
