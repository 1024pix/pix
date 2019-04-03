import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import areaColors from 'mon-pix/static-data/area-colors';

const NUMBER_OF_PIX_BY_LEVEL = 8;

export default Component.extend({

  areaColor: computed('index', function() {
    const foundArea = areaColors.find((color) => color.area === this.index.toString());
    return foundArea.color;
  }),

  percentageAheadOfNextLevel: computed('pixScoreAheadOfNextLevel', function() {
    return this.pixScoreAheadOfNextLevel / NUMBER_OF_PIX_BY_LEVEL * 100;
  }),

  displayedLevel: computed('level,percentageAheadOfNextLevel', function() {
    if (!this.level && !this.percentageAheadOfNextLevel) {
      return htmlSafe('&nbsp;');
    } else if (!this.level && this.percentageAheadOfNextLevel) {
      return '--';
    }
    return this.level;
  }),

});
