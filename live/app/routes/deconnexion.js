import Ember from 'ember';

export default Ember.Route.extend({

  session: Ember.inject.service('session'),

  beforeModel() {
    this.get('session').invalidate();
    this.transitionTo('/');
  }

});
