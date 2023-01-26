import { action } from '@ember/object';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AssessmentResultsController extends Controller {
  @tracked pageNumber = 1;
  @tracked pageSize = 50;
  @tracked divisions = [];
  @tracked groups = [];
  @tracked badges = [];
  @tracked stages = [];
  @tracked search = null;

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
  triggerFiltering(fieldName, value) {
    this[fieldName] = value || undefined;
    this.pageNumber = null;
  }

  @action
  resetFiltering() {
    this.pageNumber = null;
    this.divisions = [];
    this.groups = [];
    this.badges = [];
    this.stages = [];
    this.search = null;
  }
}
