import { computed } from '@ember/object';
import Component from '@ember/component';
import proposalsAsBlocks from 'mon-pix/utils/proposals-as-blocks';

export default Component.extend({

  classNames: ['qroc-proposal'],

  format: null,
  proposals: null,
  answerValue: null,
  answerChanged: null, // action

  _blocks: computed('proposals', function() {
    return proposalsAsBlocks(this.proposals);
  }),

  userAnswer : computed('answerValue', function() {
    const answer = this.answerValue || '';
    return answer.indexOf('#ABAND#') > -1 ? '' : answer;
  }),

  didInsertElement: function() {

    this.$('input').keydown(() => {
      this.answerChanged();
    });
  },

  willRender: function() {
    this.notifyPropertyChange('proposals');
  }
});
