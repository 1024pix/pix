import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModuleGetRoute extends Route {
  @service store;

  async model(params) {
    const module = await this.store.findRecord('module', params.slug);
    const passage = await this.store.createRecord('passage', { moduleId: params.slug }).save();

    return { module, passage };
  }
}
