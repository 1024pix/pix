import Service, { inject as service } from '@ember/service';

export default class FeaturesService extends Service {
  @service store;

  async load() {
    await this.store.queryRecord('active-feature', {});
  }
}
