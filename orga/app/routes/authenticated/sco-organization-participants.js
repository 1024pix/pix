import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ScoOrganizationParticipantsRoute extends Route {
  @service currentUser;
  @service router;

  beforeModel() {
    super.beforeModel(...arguments);
    if (!this.currentUser.isSCOManagingStudents) {
      return this.router.replaceWith('application');
    }
  }
}
