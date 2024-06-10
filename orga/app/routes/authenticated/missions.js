import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class MissionListRoute extends Route {
  @service currentUser;
  @service router;

  beforeModel() {
    if (!this.currentUser.canAccessMissionsPage) {
      this.router.replaceWith('application');
    }
  }
}
