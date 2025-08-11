import Service, { service } from '@ember/service';

export default class FeatureTogglesService extends Service {
  @service store;

  _featureToggles = undefined;

  get featureToggles() {
    return this._featureToggles;
  }

  async load() {
    this._featureToggles = await this.store.queryRecord('feature-toggle', { id: 0 });
  }
}
