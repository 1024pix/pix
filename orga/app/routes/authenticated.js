import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service('store'),
  session: service(),
  currentOrganization: service(),

  model() {
    return this.currentOrganization.organization;
  }
});
