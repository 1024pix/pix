import Ember from 'ember';

export default Ember.Component.extend({

  routing: Ember.inject.service('-routing'),

  actions: {
    identify() {
      this.get('routing').transitionTo('home');
    }
  }

});
