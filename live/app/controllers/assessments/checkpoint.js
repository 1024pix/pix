import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({

  queryParams: ['finalCheckpoint'],
  finalCheckpoint: false,

  buttonText: computed('finalCheckpoint', function() {
    return (this.get('finalCheckpoint')) ? 'Voir mes résultats' : 'Je continue';
  }),

  actions: {
    resumeAssessment(assessment) {
      if(this.get('finalCheckpoint')) {
        return this.transitionToRoute('assessments.rating', assessment);
      } else {
        return this.transitionToRoute('assessments.resume', assessment);
      }
    }
  }

});
