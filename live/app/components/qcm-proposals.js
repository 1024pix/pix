import Ember from 'ember';
import labeledCheckboxes from 'pix-live/utils/labeled-checkboxes';

export default Ember.Component.extend({

  labeledCheckboxes: Ember.computed('proposals', 'answers', function() {
    return labeledCheckboxes(this.get('proposals'), this.get('answers'));
  }),

  actions: {
    checkboxClicked: function() {
      this.sendAction('answerChanged');
    }
  }

});
