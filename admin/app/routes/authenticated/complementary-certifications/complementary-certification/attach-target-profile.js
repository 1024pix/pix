import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AttachTargetProfileRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin'],
      'authenticated.complementary-certifications.complementary-certification',
    );
  }

  model(params) {
    const targetProfileId = parseInt(params.target_profile_id);
    const complementaryCertification = this.modelFor(
      'authenticated.complementary-certifications.complementary-certification',
    );

    return {
      complementaryCertification,
      currentTargetProfile: complementaryCertification.currentTargetProfiles.find(({ id }) => id === targetProfileId),
    };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.onReset();
    }
  }
}
