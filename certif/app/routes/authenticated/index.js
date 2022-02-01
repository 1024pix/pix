import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;
  @service currentUser;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
    return this.router.replaceWith('authenticated.sessions.list');
  }
}
