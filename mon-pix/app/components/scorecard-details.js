import Component from '@ember/component';
import { computed } from '@ember/object';
import areaColors from 'mon-pix/static-data/area-colors';

const NUMBER_OF_PIX_BY_LEVEL = 8;
const MAX_DISPLAYED_PERCENTAGE = 95;

export default Component.extend({
  _MAX_REACHABLE_LEVEL: 5,

  areaColor: computed('scorecard', function() {
    const codeString = this.get('scorecard.area.code').toString();
    const foundArea = areaColors.find((color) => color.area === codeString);

    return foundArea.color;
  }),

  remainingPixToNextLevel: computed('scorecard', function() {
    return NUMBER_OF_PIX_BY_LEVEL - this.get('scorecard.pixScoreAheadOfNextLevel');
  }),

  percentageAheadOfNextLevel: computed('scorecard', function() {
    const percentage = this.get('scorecard.pixScoreAheadOfNextLevel') / NUMBER_OF_PIX_BY_LEVEL * 100;

    return Math.min(MAX_DISPLAYED_PERCENTAGE, percentage);
  }),

  earnedPixText: computed('scorecard', function() {
    const earnedPix = this.get('scorecard.earnedPix');

    return `pix gagné${earnedPix > 1 ? 's' : ''}`;
  })
});
