import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AssessmentResultsController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'divisions', 'groups', 'badges', 'stages'];

  @tracked pageNumber = 1;
  @tracked pageSize = 25;
  @tracked divisions = [];
  @tracked groups = [];
  @tracked badges = [];
  @tracked stages = [];

  @action
  goToAssessmentPage(campaignId, participantId, event) {
    event.stopPropagation();
    event.preventDefault();
    this.transitionToRoute('authenticated.campaigns.participant-assessment', campaignId, participantId);
  }

  @action
  filterByStage(stageId) {
    this.stages = [String(stageId)];
  }

  @action
  triggerFiltering(filters) {
    this.pageNumber = null;
    this.divisions = filters.divisions || this.divisions;
    this.groups = filters.groups || this.groups;
    this.badges = filters.badges || this.badges;
    this.stages = filters.stages || this.stages;
  }

  @action
  resetFiltering() {
    this.pageNumber = null;
    this.divisions = [];
    this.groups = [];
    this.badges = [];
    this.stages = [];
  }
}
