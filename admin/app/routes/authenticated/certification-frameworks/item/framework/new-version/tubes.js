import Route from '@ember/routing/route';

export default class TubeRoute extends Route {
  model() {
    return this.modelFor('authenticated.certification-frameworks.item.framework.new-version');
  }
}
