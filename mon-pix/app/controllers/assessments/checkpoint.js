import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({

  queryParams: ['finalCheckpoint'],
  finalCheckpoint: false,
  isShowingModal: false,
  answer: null,
  correction: null,
  challenge: null,

  nextPageButtonText: computed('finalCheckpoint', function() {
    return this.finalCheckpoint ? 'Voir mes résultats' : 'Continuer mon parcours';
  }),

  completionPercentage: computed('finalCheckpoint', 'model.progression.completionPercentage', function() {
    return this.finalCheckpoint ? 100 : this.get('model.progression.completionPercentage');
  }),

  actions: {
    async openComparisonWindow(answer) {
      const store = this.store;

      const correction = await store.query('correction', { answerId: answer.id }).then((corrections) => corrections.get('firstObject'));

      this.set('answer', answer);
      this.set('correction', correction);

      this.set('isShowingModal', true);
    },

    closeComparisonWindow() {
      this.set('isShowingModal', false);
    },
  }

});
