import Ember from 'ember';

export default Ember.Route.extend({

  session: Ember.inject.service(),

  beforeModel() {
    this.get('session').invalidate();
    this.transitionTo('/');
  }

});
