import Component from '@ember/component';
import { computed } from '@ember/object';

function replaceZeroByDash(number) {
  return number === 0 ? '–' : number;
}

export default Component.extend({

  scorecard: null,

  level: computed('scorecard.{level,isNotStarted}', function() {
    return this.scorecard.isNotStarted ? null : replaceZeroByDash(this.scorecard.level);
  }),

  earnedPix: computed('scorecard.earnedPix', function() {
    return replaceZeroByDash(this.scorecard.earnedPix);
  }),

});
