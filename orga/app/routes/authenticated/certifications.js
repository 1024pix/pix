import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedCertificationsRoute extends Route {
  @service currentUser;
  @service featureToggles;

  beforeModel() {
    if (!(this.featureToggles.isCertificationResultsInOrgaEnabled && this.currentUser.isSCOManagingStudents)) {
      this.replaceWith('application');
    }
  }
}
