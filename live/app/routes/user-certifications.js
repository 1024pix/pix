import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  authenticationRoute: '/connexion',
  session: service(),

  model() {
    const store = this.get('store');
    return store.findAll('certification');
  },

  actions: {
    error() {
      this.transitionTo('compte');
    }
  }
});
