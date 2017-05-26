import Ember from 'ember';
import labeledCheckboxes from 'pix-live/utils/labeled-checkboxes';
import proposalsAsArray from 'pix-live/utils/proposals-as-array';

export default Ember.Component.extend({

  answers: null,
  proposals: null,
  answerChanged: null, // action

  labeledCheckboxes: Ember.computed('proposals', 'answers', function() {
    const arrayOfProposals = proposalsAsArray(this.get('proposals'));
    return labeledCheckboxes(arrayOfProposals, this.get('answers'));
  }),

  actions: {
    checkboxClicked: function() {
      this.get('answerChanged')();
    }
  }

});
