import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class DetailsRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isMetier', 'isSupport'], 'authenticated');
  }

  async model() {
    const complementaryCertification = await this.modelFor(
      'authenticated.complementary-certifications.complementary-certification',
    );
    await complementaryCertification.reload();
    return complementaryCertification;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.reset();
    }
  }
}
