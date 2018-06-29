import _ from 'lodash';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: [ 'tutorial-panel' ],

  hint: null,
  resultItemStatus: null,
  tutorials: null,

  shouldDisplayTipsToSucceed: computed('resultItemStatus', function() {
    return this.get('resultItemStatus') !== 'ok';
  }),

  shouldDisplayHintOrTuto: computed('resultItemStatus', function() {
    return Boolean(this.get('hint')) || !_.isEmpty(this.get('tutorials'));
  }),

  shouldDisplayHint: computed('resultItemStatus', 'hint', function() {
    return Boolean(this.get('hint'));
  }),

  shouldDisplayTutorial: computed('resultItemStatus', 'tutorials', function() {
    return !_.isEmpty(this.get('tutorials'));
  }),

  limitedTutorials: computed('tutorials', function() {
    return this.get('tutorials').slice(0, 3);
  }),

});
