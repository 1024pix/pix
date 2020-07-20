import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Controller from '@ember/controller';

export default class CheckpointController extends Controller {
  queryParams = ['finalCheckpoint', 'newLevel', 'competenceLeveled'];

  @tracked answer = null;
  @tracked challenge = null;
  @tracked competenceLeveled = null;
  @tracked finalCheckpoint = false;
  @tracked isShowingModal = false;
  @tracked newLevel = null;

  get showLevelup() {
    return this.model.showLevelup && this.newLevel;
  }

  get nextPageButtonText() {
    return this.finalCheckpoint ? 'Voir mes résultats' : 'Continuer mon parcours';
  }

  get completionPercentage() {
    return this.finalCheckpoint ? 100 : this.model.get('progression.completionPercentage');
  }

  get shouldDisplayAnswers() {
    return !!this.model.answersSinceLastCheckpoints.length;
  }

  get pageTitle() {
    return this.finalCheckpoint ? 'Fin de votre évaluation' : 'Avancement de l\'évaluation';
  }

  @action
  openComparisonWindow(answer) {
    this.answer = answer;
    this.isShowingModal = true;
  }

  @action
  closeComparisonWindow() {
    this.isShowingModal = false;
  }
}
