import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class StudentsRoute extends Route {
  @service currentUser;

  beforeModel() {
    super.beforeModel(...arguments);
    if (!this.currentUser.canAccessStudentsPage) {
      return this.replaceWith('application');
    }
  }
}
