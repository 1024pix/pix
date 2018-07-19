import BaseRoute from 'pix-live/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  model() {
    return this.get('store').findAll('certification');
  }

});
