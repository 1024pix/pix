import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default class TermsOfServiceRoute extends Route.extend(AuthenticatedRouteMixin) {

  @service currentUser;

  beforeModel() {
    super.beforeModel(...arguments);
    if (this.currentUser.user.pixCertifTermsOfServiceAccepted) {
      return this.transitionTo('authenticated.sessions.list');
    }
  }
}
