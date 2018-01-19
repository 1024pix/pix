import { computed } from '@ember/object';
import Component from '@ember/component';
import createProposalAnswerTuples from 'pix-live/utils/labeled-checkboxes';
import proposalsAsArray from 'pix-live/utils/proposals-as-array';
import valueAsArrayOfBoolean from 'pix-live/utils/value-as-array-of-boolean';

export default Component.extend({

  answersValue: null,
  proposals: null,
  answerChanged: null,

  labeledCheckboxes: computed('proposals', 'answersValue', function() {
    const arrayOfProposals = proposalsAsArray(this.get('proposals'));
    const arrayOfBoolean = valueAsArrayOfBoolean(this.get('answersValue'));

    return createProposalAnswerTuples(arrayOfProposals, arrayOfBoolean);
  }),

  actions: {
    checkboxCliked() {
      this.get('answerChanged')();
    }
  }
});
