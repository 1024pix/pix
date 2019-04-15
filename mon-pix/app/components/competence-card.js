import Component from '@ember/component';
import { computed } from '@ember/object';
import areaColors from 'mon-pix/static-data/area-colors';

const NUMBER_OF_PIX_BY_LEVEL = 8;
const MAX_DISPLAYED_PERCENTAGE = 95;

export default Component.extend({

  areaColor: computed('scorecard.area', function() {
    const foundArea = areaColors.find((color) => color.area === this.scorecard.area.get('code').toString());
    return foundArea.color;
  }),

  percentageAheadOfNextLevel: computed('scorecard.pixScoreAheadOfNextLevel', function() {
    const percentage = this.scorecard.pixScoreAheadOfNextLevel / NUMBER_OF_PIX_BY_LEVEL * 100;
    return percentage >= MAX_DISPLAYED_PERCENTAGE ? MAX_DISPLAYED_PERCENTAGE : percentage;
  }),

  displayedLevel: computed('scorecard.level', 'percentageAheadOfNextLevel', function() {
    if (!this.scorecard.level && !this.percentageAheadOfNextLevel) {
      return null;
    } else if (!this.scorecard.level && this.percentageAheadOfNextLevel) {
      return '–';
    }
    return this.scorecard.level;
  }),

});
