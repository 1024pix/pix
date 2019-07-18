import Component from '@ember/component';
import { computed } from '@ember/object';
import constants from 'mon-pix/static-data/constants-pix-and-level';

export default Component.extend({
  scorecard: null,

  displayedLevel: computed('scorecard.{level,isNotStarted}', function() {
    if (this.scorecard.isNotStarted) {
      return null;
    }
    return Math.min(this.scorecard.level, constants.MAX_REACHABLE_LEVEL);
  }),
});
