import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  finalCheckpoint: false,
  isShowingModal: false,
  answer: null,
  challenge: null,

  completionPercentage: computed('finalCheckpoint', 'assessment.progression.completionPercentage', function() {
    return this.finalCheckpoint ? 100 : this.get('assessment.progression.completionPercentage');
  }),

  shouldDisplayAnswers: computed('assessment.answersSinceLastCheckpoints', function() {
    return !!this.get('assessment.answersSinceLastCheckpoints.length');
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
