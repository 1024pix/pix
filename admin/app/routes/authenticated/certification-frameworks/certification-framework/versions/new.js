import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class FrameworkNewRoute extends Route {
  queryParams = {
    activeVersionId: { refreshModel: true },
  };
  @service store;
  @service router;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin'],
      'authenticated.certification-frameworks.certification-framework',
    );
  }

  async model(params) {
    let activeVersion;
    const frameworks = await this.store.findAll('framework');
    const item = await this.modelFor('authenticated.certification-frameworks.certification-framework');
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
