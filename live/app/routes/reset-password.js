import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend(UnauthenticatedRouteMixin, {

  session: service(),

  model(params) {
    return this.get('store').findRecord('password-reset-demand', params.temporaryKey);
  }

});
