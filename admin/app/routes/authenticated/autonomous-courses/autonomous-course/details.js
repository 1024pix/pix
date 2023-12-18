import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AutonomousCourseDetailsRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model() {
    return this.modelFor('authenticated.autonomous-courses.autonomous-course');
  }
}
