import Controller from '@ember/controller';
import { computed } from '@ember/object';

const { and } = computed;

export default Controller.extend({

  queryParams: ['finalCheckpoint', 'newLevel', 'competenceLeveled'],

  finalCheckpoint: false,
  newLevel: null,
  competenceLeveled: null,

  isShowingModal: false,
  answer: null,
  challenge: null,

  showLevelup: and('model.showLevelup', 'newLevel'),

  nextPageButtonText: computed('finalCheckpoint', function() {
    return this.finalCheckpoint ? 'Voir mes résultats' : 'Continuer mon parcours';
  }),

  completionPercentage: computed('finalCheckpoint', 'model.progression.completionPercentage', function() {
    return this.finalCheckpoint ? 100 : this.get('model.progression.completionPercentage');
  }),

  shouldDisplayAnswers: computed('model.answersSinceLastCheckpoints', function() {
    return !!this.get('model.answersSinceLastCheckpoints.length');
  }),

  pageTitle: computed('finalCheckpoint', function() {
    return this.finalCheckpoint ? 'Fin de votre évaluation' : 'Avancement de l\'évaluation';
  }),

  actions: {
    openComparisonWindow(answer) {
      this.set('answer', answer);
      this.set('isShowingModal', true);
    },

    closeComparisonWindow() {
      this.set('isShowingModal', false);
    },
  }
});
