import Route from '@ember/routing/route';
import { service } from '@ember/service';
import get from 'lodash/get';

export default class AuthenticatedRoute extends Route {
  @service currentUser;
  @service router;
  @service session;
  @service store;

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

  async model() {
    if (this.currentUser.prescriber.placesManagement) {
      return await this.store.queryRecord('organization-place-statistic', {
        organizationId: this.currentUser.organization.id,
      });
    } else return null;
  }
}
