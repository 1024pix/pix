import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['challenge-actions'],

  actions: {

    skip: function() {
      this.sendAction('skip');
    },
    validate: function() {
      this.sendAction('validate');
    }
  }

});
