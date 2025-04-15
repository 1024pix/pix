import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ToolsRoute extends Route {
  @service currentUser;
  @service router;
  @service accessControl;

  beforeModel() {
    if (this.currentUser.adminMember.isCertif) {
      this.router.transitionTo('authenticated.tools.certification');
    } else {
      this.router.transitionTo('authenticated.tools.campaigns');
    }
  }
}
