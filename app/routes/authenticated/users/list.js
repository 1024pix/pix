import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  beforeModel() {
    this.get('store').unloadAll('user');
  },

  model() {
    // ℹ️ We use `#query` instead of `#findAll` because only the first one handle metadata
    return this.get('store').query('user', {});
  }

});
