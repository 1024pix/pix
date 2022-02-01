import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import get from 'lodash/get';

export default class AuthenticatedRoute extends Route {
  @service currentUser;
  @service router;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');

    if (transition.isAborted) {
      return;
    }

    const pixOrgaTermsOfServiceAccepted = get(this.currentUser, 'prescriber.pixOrgaTermsOfServiceAccepted');
    if (!pixOrgaTermsOfServiceAccepted) {
      return this.router.replaceWith('terms-of-service');
    }
  }
}
