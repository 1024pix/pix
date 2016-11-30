import Ember from 'ember';

export default Ember.Component.extend({

  actions: {

    skip: function () {
      this.sendAction('skip');
    },
    validate: function () {
      this.sendAction('validate');
    }
  }

});
