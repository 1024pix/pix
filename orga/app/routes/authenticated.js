import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import get from 'lodash/get';

export default class AuthenticatedRoute extends Route {
  @service currentUser;
  @service router;
  @service session;
  @service store;

  beforeModel(transition) {
    // todo(auth)
    const encodedRedirectUri = encodeURIComponent(`${window.location.href}`);
    const authRoute = `http://localhost:4206?redirect_uri=${encodedRedirectUri}`;
    this.session.requireAuthentication(transition, () => {
      window.location = authRoute;
    });

    if (transition.isAborted) {
      return;
    }

    const pixOrgaTermsOfServiceStatus = get(this.currentUser, 'prescriber.pixOrgaTermsOfServiceStatus');
    if (pixOrgaTermsOfServiceStatus !== 'accepted') {
      return this.router.replaceWith('terms-of-service');
    }
  }

  async model() {
    if (this.currentUser.prescriber.placesManagement) {
      return this.store.queryRecord('organization-place-statistic', {
        organizationId: this.currentUser.organization.id,
      });
    } else return null;
  }

  @action
  refreshAuthenticatedModel() {
    this.refresh();
  }
}
