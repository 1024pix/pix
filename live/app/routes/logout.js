import Ember from 'ember';

export default Ember.Route.extend({

  session: Ember.inject.service(),

  beforeModel() {
    const session = this.get('session');
    if (session.get('isAuthenticated')) {
      session.invalidate();
    }
    this.transitionTo('/');
  }

});
