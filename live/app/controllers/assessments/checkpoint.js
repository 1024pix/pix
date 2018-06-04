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
      const nextRoute = this.get('finalCheckpoint') ? 'assessments.rating' : 'assessments.resume';
      return this.transitionToRoute(nextRoute, assessment);
    }
  }

});
