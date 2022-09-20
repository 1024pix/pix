import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class NotFoundRoute extends Route {
  @service router;

  afterModel(model, transition) {
    transition.abort();
    this.router.transitionTo('authenticated');
  }
}
