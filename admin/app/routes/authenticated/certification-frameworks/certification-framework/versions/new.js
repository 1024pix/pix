import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class FrameworkNewRoute extends Route {
  @service store;
  @service router;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin'],
      'authenticated.certification-frameworks.certification-framework',
    );
  }

  async model() {
    const frameworks = await this.store.findAll('framework');
    const { certificationFramework, activeVersion } = await this.modelFor(
      'authenticated.certification-frameworks.certification-framework.versions',
    );

    return {
      frameworks,
      scope: certificationFramework.scope,
      activeVersion,
    };
  }
}
