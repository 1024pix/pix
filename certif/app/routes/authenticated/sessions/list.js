import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ListRoute extends Route {
  @service router;

  beforeModel() {
    this.router.replaceWith('authenticated.sessions');
  }
}
