import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),

  model() {
    return this.currentUser.organization;
  },

  afterModel() {
    if (!this.currentUser.user.pixOrgaTermsOfServiceAccepted) {
      return this.transitionTo('authenticated.terms-of-service');
    }
  }
});
