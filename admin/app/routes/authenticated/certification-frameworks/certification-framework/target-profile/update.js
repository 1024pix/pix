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

  model(params) {
    const { currentComplementaryCertification } = this.modelFor(
      'authenticated.certification-frameworks.certification-framework.target-profile',
    );

    const targetProfileId = parseInt(params.target_profile_id);

    return {
      complementaryCertification: currentComplementaryCertification,
      currentTargetProfile: currentComplementaryCertification.currentTargetProfiles?.find(
        ({ id }) => id === targetProfileId,
      ),
    };
  }
}
