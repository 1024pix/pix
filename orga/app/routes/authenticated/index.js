import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;

  beforeModel() {
    return this.router.replaceWith('authenticated.campaigns');
  }
}
