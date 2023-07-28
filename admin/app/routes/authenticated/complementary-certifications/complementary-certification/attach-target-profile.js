import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ComplementaryCertificationAttachRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isMetier', 'isSupport'], 'authenticated');
  }

  async model() {
    return this.modelFor('authenticated.complementary-certifications.complementary-certification');
  }
}
