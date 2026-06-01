import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class FrameworkRoute extends Route {
  queryParams = {
    activeVersionId: { refreshModel: true },
  };
  @service store;

  async model(params) {
    let activeVersion;
    const frameworks = await this.store.findAll('framework');
    const item = await this.modelFor('authenticated.certification-frameworks.item');
    if (params?.activeVersionId) {
      activeVersion = await this.store.findRecord('certification-version', params.activeVersionId);
    }
    return RSVP.hash({
      frameworks,
      scope: item.frameworkKey,
      activeVersion,
    });
  }
}
