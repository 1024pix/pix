import Ember from 'ember';
import  proposalsAsBlocks from 'pix-live/utils/proposals-as-blocks';

export default Ember.Component.extend({

  classNames: ['qroc-proposal'],

  proposals: null,
  answerValue: null,
  answerChanged: null, // action

  _blocks: Ember.computed('proposals', function() {
    return proposalsAsBlocks(this.get('proposals'));
  }),

  userAnswer : Ember.computed('answerValue', function() {
    const answer = this.get('answerValue') || '';
    return answer.indexOf('#ABAND#') > -1? '' : answer;
  }),

  didInsertElement: function() {

    this.$('input').keydown(() => {
      this.get('answerChanged')();
    });
  }
});
