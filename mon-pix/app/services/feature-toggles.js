import Service, { service } from '@ember/service';

export default class FeatureTogglesService extends Service {
  @service config;

  get featureToggles() {
    return this.config.featureToggles;
  }
}
