import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModuleRecapRoute extends Route {
  @service store;
  @service router;

  beforeModel(transition) {
    if (!transition.from) {
      return this.router.replaceWith('module.details');
    }
  }

  model() {
    return this.modelFor('module.get');
  }
}
