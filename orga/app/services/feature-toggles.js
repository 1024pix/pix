import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class FeatureTogglesService extends Service {
  @service store;
  @tracked isCertificationResultsInOrgaEnabled;

  async load() {
    this.featureToggles = await this.store.queryRecord('feature-toggle', { id: 0 });
    this.isCertificationResultsInOrgaEnabled = this.featureToggles.isCertificationResultsInOrgaEnabled;
  }
}
