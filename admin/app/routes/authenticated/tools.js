import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ToolsRoute extends Route {
  @service router;
  @service currentUser;

  beforeModel() {
    if (!this.currentUser.adminMember.hasAccess(['isSuperAdmin'])) {
      this.router.transitionTo('authenticated');
    }
  }
}
