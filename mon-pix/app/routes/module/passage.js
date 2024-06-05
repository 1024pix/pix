import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModulePassageRoute extends Route {
  @service store;

  async model() {
    const module = this.modelFor('module');
    const passage = await this.store.createRecord('passage', { moduleId: module.id }).save();

    return { module, passage };
  }
}
