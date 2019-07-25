import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['checkpoint__continue'],

  finalCheckpoint: false,

  nextPageButtonText: computed('finalCheckpoint', function() {
    return this.finalCheckpoint ? 'Voir mes résultats' : 'Continuer mon parcours';
  }),
});
