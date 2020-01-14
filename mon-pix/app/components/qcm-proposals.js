import { computed } from '@ember/object';
import Component from '@ember/component';
import createProposalAnswerTuples from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';

export default Component.extend({

  answerValue: null,
  proposals: null,
  answerChanged: null,
  classNames: ['qcm-proposals'],

  labeledCheckboxes: computed('proposals', 'answerValue', function() {
    const arrayOfProposals = proposalsAsArray(this.proposals);
    const arrayOfBoolean = valueAsArrayOfBoolean(this.answerValue);

    return createProposalAnswerTuples(arrayOfProposals, arrayOfBoolean);
  }),

  actions: {
    checkboxClicked() {
      this.answerChanged();
    }
  }
});
