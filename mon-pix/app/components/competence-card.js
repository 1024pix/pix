import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import domainColors from 'mon-pix/static-data/domain-colors';

const NUMBER_OF_PIX_BY_LEVEL = 8;

export default Component.extend({

  domainColorStyle: computed('index', function() {
    const foundDomain = domainColors.find((color) => color.domain === this.index.toString());
    return foundDomain.colorName;
  }),

  percentageAheadOfNextLevel: computed('pixScoreAheadOfNextLevel', function() {
    return this.pixScoreAheadOfNextLevel / NUMBER_OF_PIX_BY_LEVEL * 100;
  }),

});
