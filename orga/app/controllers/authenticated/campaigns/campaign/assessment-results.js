import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AssessmentResultsController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'divisions', 'badges', 'stages'];

  @tracked pageNumber = 1;
  @tracked pageSize = 25;
  @tracked divisions = [];
  @tracked badges = [];
  @tracked stages = [];

  @action
  goToAssessmentPage(campaignId, participantId, event) {
    event.stopPropagation();
    this.transitionToRoute('authenticated.campaigns.assessment', campaignId, participantId);
  }

  @action
  filterByStage(stageId) {
    this.stages = [String(stageId)];
  }

  @action
  triggerFiltering(filters) {
    this.pageNumber = null;
    this.divisions = filters.divisions || this.divisions;
    this.badges = filters.badges || this.badges;
    this.stages = filters.stages || this.stages;
  }

  @action
  resetFiltering() {
    this.pageNumber = null;
    this.divisions = [];
    this.badges = [];
    this.stages = [];
  }
}
