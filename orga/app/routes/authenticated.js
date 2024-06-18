import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import get from 'lodash/get';
import RSVP from 'rsvp';

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
      return RSVP.hash({
        available: this.store.queryRecord('organization-place-statistic', {
          organizationId: this.currentUser.organization.id,
        }),
      });
    }
    if (this.currentUser.canAccessMissionsPage) {
      // when user can access mission page, we force load currentUser
      // so the page is re rendered and session status can be live updated
      await this.currentUser.load();
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
