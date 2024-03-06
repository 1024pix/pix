import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModuleRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('module', params.slug);
  }
}
