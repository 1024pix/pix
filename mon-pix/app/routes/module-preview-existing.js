import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModulePreviewExistingRoute extends Route {
  @service store;

  async model(params) {
    const queryRecord = await this.store.queryRecord('module', { slug: params.slug, shortId: params.shortId });
    return queryRecord;
  }
}
