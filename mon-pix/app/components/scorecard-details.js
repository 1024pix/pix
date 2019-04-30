import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  earnedPixText: computed('scorecard.earnedPix', function() {
    const earnedPix = this.scorecard.get('earnedPix');

    return `pix gagné${earnedPix > 1 ? 's' : ''}`;
  })
});
