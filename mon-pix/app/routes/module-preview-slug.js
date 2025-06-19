import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModulePreviewSlugRoute extends Route {
  @service store;

  async model(params) {
    const queryRecord = await this.store.queryRecord('module', { slug: params.slug });
    console.log(params.slug);
    return queryRecord;
  }
}
