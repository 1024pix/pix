import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AttachTargetProfileNewRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin'],
      'authenticated.complementary-certifications.complementary-certification',
    );
  }

  model(_) {
    const complementaryCertification = this.modelFor(
      'authenticated.complementary-certifications.complementary-certification',
    );

    return {
      complementaryCertification,
      currentTargetProfile: null,
    };
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.onReset();
    }
  }
}
