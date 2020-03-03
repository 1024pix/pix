import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class AuthenticatedRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service currentUser;

  beforeModel(transition) {
    super.beforeModel(...arguments);
    if (transition.isAborted) {
      return;
    }
    if (!this.currentUser.user.pixOrgaTermsOfServiceAccepted) {
      return this.replaceWith('terms-of-service');
    }
  }
}
