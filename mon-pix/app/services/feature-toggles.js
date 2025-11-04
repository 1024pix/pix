import Service from '@ember/service';

export default class FeatureTogglesService extends Service {
  get featureToggles() {
    return this._featureToggles;
  }

  async set(featureToggles) {
    this._featureToggles = featureToggles;
  }
}
