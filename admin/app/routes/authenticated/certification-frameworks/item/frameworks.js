import Route from '@ember/routing/route';

export default class FrameworkRoute extends Route {
  model() {
    return this.modelFor('authenticated.certification-frameworks.item');
  }
}
