import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class SupStudentsRoute extends Route {
  @service currentUser;

  beforeModel() {
    if (!this.currentUser.isSUPManagingStudents) {
      return this.replaceWith('application');
    }
  }
}
