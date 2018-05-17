import BaseRoute from 'pix-live/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  model() {
    const store = this.get('store');
    store.unloadAll('certification');
    return store.findAll('certification');
  },

  actions: {
    error() {
      this.transitionTo('compte');
    }
  }
});
