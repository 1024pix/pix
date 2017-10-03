import Ember from 'ember';

export default Ember.Route.extend({
  afterModel(model, transition) {
    transition.abort();
    this.transitionTo('index');
  }
});
