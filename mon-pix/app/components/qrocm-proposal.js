import Component from '@ember/component';
import { computed } from '@ember/object';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default Component.extend({

  classNames: ['qrocm-proposal'],

  proposals: null,
  answersValue: null,
  answerChanged: null, // action
  format: null,

  _blocks: computed('proposals', function() {
    return proposalsAsBlocks(this.proposals)
      .map((block) => {
        block.showText = block.text && !block.ariaLabel && !block.input;
        return block;
      });
  }),

  actions: {
    onInputChange: function() {
      this.answerChanged();
    }
  }

});
