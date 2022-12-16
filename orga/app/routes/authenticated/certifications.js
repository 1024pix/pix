import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedCertificationsRoute extends Route {
  @service currentUser;

  beforeModel() {
    if (!(this.currentUser.isAdminInOrganization && this.currentUser.isSCOManagingStudents)) {
      this.replaceWith('application');
    }
  }

  async model() {
    const divisions = await this.currentUser.organization.divisions;
    const options = divisions.map(({ name }) => ({ label: name, value: name }));
    return { options };
  }
}
