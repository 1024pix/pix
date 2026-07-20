import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class VersionsRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin'],
      'authenticated.certification-frameworks.certification-framework',
    );
  }

  async model() {
    const certificationFramework = this.modelFor('authenticated.certification-frameworks.certification-framework');
    const activeVersionId = certificationFramework.activeVersionId;
    const activeVersion = activeVersionId
      ? await this.store.findRecord('certification-version', activeVersionId)
      : null;
    return { certificationFramework, activeVersion };
  }
}
