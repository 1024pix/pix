import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AutonomousCoursesRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }
}
