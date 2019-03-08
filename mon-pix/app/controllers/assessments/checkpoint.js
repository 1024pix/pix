import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default Controller.extend({

  pixModalDialog: service(),

  queryParams: ['finalCheckpoint'],
  finalCheckpoint: false,
  isShowingModal: false,
  answer: null,
  correction: null,
  challenge: null,

  nextPageButtonText: computed('finalCheckpoint', function() {
    return this.get('finalCheckpoint') ? 'Voir mes résultats' : 'Continuer mon parcours';
  }),

  actions: {
    async openComparisonWindow(answerId) {
      const store = this.get('store');

      const answer = await store.findRecord('answer', answerId);
      this.set('answer', answer);
      const challenge = await answer.get('challenge');
      this.set('challenge', challenge);
      const correction = await store.query('correction', { answerId }).then((corrections) => corrections.get('firstObject'));
      this.set('correction', correction);

      this.pixModalDialog.enableScrolling();
      this.set('isShowingModal', true);
    },

    closeComparisonWindow() {
      this.set('isShowingModal', false);
      this.pixModalDialog.disableScrolling();
    },
  }

});
