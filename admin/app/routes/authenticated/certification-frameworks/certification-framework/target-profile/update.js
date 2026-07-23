import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AttachTargetProfileRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin'],
      'authenticated.certification-frameworks.certification-framework.target-profile',
    );
  }

  async model(params) {
    const certificationFramework = this.modelFor(
      'authenticated.certification-frameworks.certification-framework.target-profile',
    );
    const complementaryCertification = await certificationFramework.belongsTo('complementaryCertification').load();

    const targetProfileId = parseInt(params.target_profile_id);

    return {
      complementaryCertification,
      currentTargetProfile: complementaryCertification.currentTargetProfiles?.find(({ id }) => id === targetProfileId),
    };
  }
}
