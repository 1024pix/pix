import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {

  currentUser: service(),

  beforeModel(transition) {
    this._super(...arguments);
    if (transition.isAborted) {
      return;
    }
    if (this.currentUser.user.pixOrgaTermsOfServiceAccepted) {
      return this.replaceWith('');
    }
  },
});
