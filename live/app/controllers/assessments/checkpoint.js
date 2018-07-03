import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({

  queryParams: ['finalCheckpoint'],
  finalCheckpoint: false,

  buttonText: computed('finalCheckpoint', function() {
    return this.get('finalCheckpoint') ? 'Voir mes résultats' : 'Je continue';
  }),

  actions: {
    resumeAssessment(assessment) {
      const nextRoute = this.get('finalCheckpoint') ? 'campaigns.skill-review' : 'assessments.resume';
      return this.transitionToRoute(nextRoute, assessment.get('id'));
    },

    openComparison(assessment_id, answer_id, index) {
      return this.transitionToRoute('assessments.comparison', assessment_id, answer_id, index);
    }
  }

});
