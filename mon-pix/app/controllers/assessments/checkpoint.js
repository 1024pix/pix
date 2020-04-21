import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import Controller from '@ember/controller';

const { and } = computed;

@classic
export default class CheckpointController extends Controller {
  queryParams = ['finalCheckpoint', 'newLevel', 'competenceLeveled'];
  finalCheckpoint = false;
  newLevel = null;
  competenceLeveled = null;
  isShowingModal = false;
  answer = null;
  challenge = null;

  @and('model.showLevelup', 'newLevel')
  showLevelup;

  @computed('finalCheckpoint')
  get nextPageButtonText() {
    return this.finalCheckpoint ? 'Voir mes résultats' : 'Continuer mon parcours';
  }

  @computed('finalCheckpoint', 'model.progression.completionPercentage')
  get completionPercentage() {
    return this.finalCheckpoint ? 100 : this.model.get('progression.completionPercentage');
  }

  @computed('model.answersSinceLastCheckpoints')
  get shouldDisplayAnswers() {
    return !!this.model.answersSinceLastCheckpoints.length;
  }

  @computed('finalCheckpoint')
  get pageTitle() {
    return this.finalCheckpoint ? 'Fin de votre évaluation' : 'Avancement de l\'évaluation';
  }

  @action
  openComparisonWindow(answer) {
    this.set('answer', answer);
    this.set('isShowingModal', true);
  }

  @action
  closeComparisonWindow() {
    this.set('isShowingModal', false);
  }
}
