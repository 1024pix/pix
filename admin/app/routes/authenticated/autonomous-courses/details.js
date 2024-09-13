import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class DetailsRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  model(params) {
    return this.store.findRecord('autonomous-course', params.autonomous_course_id);
  }
}
