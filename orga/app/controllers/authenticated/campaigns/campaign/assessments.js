import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AssessmentsController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'divisions', 'badges'];

  @tracked pageNumber = 1;
  @tracked pageSize = 10;
  @tracked divisions = [];
  @tracked badges = [];

  @action
  goToAssessmentPage(campaignId, participantId) {
    this.transitionToRoute('authenticated.campaigns.assessment', campaignId, participantId);
  }

  @action
  triggerFiltering(filters) {
    this.pageNumber = null;
    this.divisions = filters.divisions || this.divisions;
    this.badges = filters.badges || this.badges;
  }
}
