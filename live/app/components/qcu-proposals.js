import { computed } from '@ember/object';
import Component from '@ember/component';
import labeledCheckboxes from 'pix-live/utils/labeled-checkboxes';
import proposalsAsArray from 'pix-live/utils/proposals-as-array';
import valueAsArrayOfBoolean from 'pix-live/utils/value-as-array-of-boolean';

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
