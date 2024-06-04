import Route from '@ember/routing/route';

export default class ModuleDetailsRoute extends Route {
  model() {
    return this.modelFor('module');
  }
}
