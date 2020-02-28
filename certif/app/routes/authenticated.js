import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default class Authenticated extends Route.extend(AuthenticatedRouteMixin) {
  @service currentUser;

  beforeModel(transition) {
    super.beforeModel(...arguments);
    if (transition.isAborted) {
      return;
    }
    if (!this.currentUser.user.pixCertifTermsOfServiceAccepted) {
      return this.replaceWith('terms-of-service');
    }
  }

  model() {
    return this.currentUser.certificationCenter;
  }
}
