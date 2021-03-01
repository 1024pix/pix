import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedCertificationsRoute extends Route {
  @service currentUser;
  @service featureToggles;

  beforeModel() {
    if (!(this.featureToggles.isCertificationResultsInOrgaEnabled && (this.currentUser.isAdminInOrganization && this.currentUser.isSCOManagingStudents))) {
      this.replaceWith('application');
    }
  }

  async model() {
    const organizationId = this.currentUser.organization.id;
    const divisions = await this.store.query('division', { organizationId });

    const options = _generateLabelsAndValues(divisions);

    return { options };
  }
}

function _generateLabelsAndValues(divisions) {
  const options = [];
  divisions.forEach((division) => options.push({ label: division.name, value: division.name }));

  return options;
}
