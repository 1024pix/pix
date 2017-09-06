import Ember from 'ember';

import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  session: Ember.inject.service(),

  beforeModel() {
    const session = this.get('session');
    if (session.get('isAuthenticated')) {
      session.invalidate();
    }
    this.transitionTo('/');
  }

});
