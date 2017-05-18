import Ember from 'ember';
import labeledCheckboxes from 'pix-live/utils/labeled-checkboxes';
import proposalsAsArray from 'pix-live/utils/proposals-as-array';

export default Ember.Component.extend({

  answers: null,
  proposals: null,
  answerChanged: null, // action

  labeledRadios: Ember.computed('proposals', 'answers', function() {
    const arrayOfProposals = proposalsAsArray(this.get('proposals'));
    return labeledCheckboxes(arrayOfProposals, this.get('answers'));
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
