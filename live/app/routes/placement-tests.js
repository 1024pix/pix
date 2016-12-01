import Ember from 'ember';

export default Ember.Route.extend({

  delay: Ember.inject.service(),

  model() {
    return this.store.query('course', { adaptive: true });
  }
});
