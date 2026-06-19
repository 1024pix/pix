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
    this.accessControl.restrictAccessTo(['isSuperAdmin'], 'authenticated.certification-frameworks.frameworks');
  }

  async model(params) {
    let activeVersion;
    const frameworks = await this.store.findAll('framework');
    if (params?.activeVersionId) {
      activeVersion = await this.store.findRecord('certification-version', params.activeVersionId);
    }
    return RSVP.hash({
      frameworks,
      scope: params.frameworkKey,
      activeVersion,
    });
  }
}
