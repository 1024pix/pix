import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModuleRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    return await this.store.findRecord('module', params.slug);
  }

  redirect(model, transition) {
    if (transition.targetName !== 'module.get') {
      this.router.transitionTo('module.details', model);
    }
  }
}
