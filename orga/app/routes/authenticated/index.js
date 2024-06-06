import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;
  @service currentUser;
  beforeModel() {
    return this.router.replaceWith(this.currentUser.homePage);
  }
}
