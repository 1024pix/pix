import { computed } from '@ember/object';
import Component from '@ember/component';
import  proposalsAsBlocks from 'pix-live/utils/proposals-as-blocks';

export default Component.extend({

  classNames: ['qroc-proposal'],

  proposals: null,
  answerValue: null,
  answerChanged: null, // action

  _blocks: computed('proposals', function() {
    return proposalsAsBlocks(this.get('proposals'));
  }),

  userAnswer : computed('answerValue', function() {
    const answer = this.get('answerValue') || '';
    return answer.indexOf('#ABAND#') > -1? '' : answer;
  }),

  didInsertElement: function() {

    this.$('input').keydown(() => {
      this.get('answerChanged')();
    });
  }
});
