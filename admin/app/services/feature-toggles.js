import Service, { inject as service } from '@ember/service';

export default class FeatureTogglesService extends Service {
  @service store;

  async load() {
    this.featureToggles = await this.store.queryRecord('feature-toggle', { id: 0 });
  }
}
