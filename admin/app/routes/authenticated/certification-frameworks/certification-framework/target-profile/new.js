import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AttachTargetProfileNewRoute extends Route {
  @service('store') store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin'],
      'authenticated.certification-frameworks.certification-framework.target-profile',
    );
  }

  async model() {
    const certificationFramework = this.modelFor(
      'authenticated.certification-frameworks.certification-framework.target-profile',
    );
    const complementaryCertifications = await this.store.findAll('complementary-certification');
    return complementaryCertifications.find((cc) => cc.key === certificationFramework.scope);
  }
}
