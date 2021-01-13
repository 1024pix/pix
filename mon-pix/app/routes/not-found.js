import Route from '@ember/routing/route';

export default class NotFoundRoute extends Route {
  afterModel(model, transition) {
    transition.abort();
    this.transitionTo('index');
  }
}
