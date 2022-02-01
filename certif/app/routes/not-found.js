import Route from '@ember/routing/route';

export default class NotFoundRoute extends Route {
  afterModel() {
    this.transitionTo('application');
  }
}
