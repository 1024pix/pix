import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  beforeModel() {
    this.get('store').unloadAll('organization');
  },

  model() {
    return this.get('store').findAll('organization');
  }

});
