import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({

  queryParams: ['finalCheckpoint'],
  finalCheckpoint: false,

  nextPageButtonText: computed('finalCheckpoint', function() {
    return this.get('finalCheckpoint') ? 'Voir mes résultats' : 'Je continue';
  }),

  actions: {
    openComparison(assessment_id, answer_id, index) {
      return this.transitionToRoute('assessments.comparison', assessment_id, answer_id, index);
    }
  }

});
