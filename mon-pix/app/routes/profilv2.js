import { inject as service } from '@ember/service';

import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  session: service(),

  model() {
    return this.store.findRecord('user', this.get('session.data.authenticated.userId'), {
      reload: true
    });
  },

  afterModel(model) {
    if (model.get('organizations.length') > 0) {
      return this.transitionTo('board');
    }
  }
});
