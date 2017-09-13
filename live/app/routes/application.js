import Ember from 'ember';

import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({
  splash: Ember.inject.service(),

  activate() {
    this.get('splash').hide();
  }
});
