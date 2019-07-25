import Controller from '@ember/controller';
import { computed } from '@ember/object';

export default Controller.extend({
  queryParams: ['finalCheckpoint'],
  finalCheckpoint: false,

  nextRoute: computed('finalCheckpoint', function() {
    return this.finalCheckpoint ? 'competence.results' : 'competence.assessment';
  }),
});
