import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class IndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('authenticated.autonomous-courses.list');
  }
}
