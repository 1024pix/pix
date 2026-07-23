import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AttachTargetProfileNewRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin'],
      'authenticated.certification-frameworks.certification-framework.target-profile',
    );
  }

  async model(_) {
    const certificationFramework = this.modelFor(
      'authenticated.certification-frameworks.certification-framework.target-profile',
    );

    const complementaryCertification = await certificationFramework.belongsTo('complementaryCertification').load();
    return {
      complementaryCertification,
      currentTargetProfile: null,
    };
  }
}
