import { computed } from '@ember/object';
import Component from '@ember/component';
import labeledCheckboxes from 'mon-pix/utils/labeled-checkboxes';
import proposalsAsArray from 'mon-pix/utils/proposals-as-array';
import valueAsArrayOfBoolean from 'mon-pix/utils/value-as-array-of-boolean';

export default Component.extend({

  answersValue: null,
  proposals: null,
  answerChanged: null, // action

  labeledRadios: computed('proposals', 'answersValue', function() {
    const arrayOfProposals = proposalsAsArray(this.get('proposals'));
    return labeledCheckboxes(arrayOfProposals, valueAsArrayOfBoolean(this.get('answersValue')));
  }),

  _uncheckAllRadioButtons() {
    this.$(':radio').prop('checked', false);
  },

  _checkAgainTheSelectedOption(index) {
    this.$(`:radio:nth(${index})`).prop('checked', true);
  },

  actions: {
    radioClicked(index) {
      this._uncheckAllRadioButtons();
      this._checkAgainTheSelectedOption(index);
      this.get('answerChanged')();
    }
  }

});
