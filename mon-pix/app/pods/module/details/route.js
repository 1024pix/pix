import Route from '@ember/routing/route';

export default class ModuleDetailsRoute extends Route {
  async model() {
    return this.modelFor('module');
  }
}
