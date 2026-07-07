import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class BlueprintRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isMetier'], 'authenticated');
  }

  async model(params) {
    return this.store.findRecord('combined-course-blueprint', params.combined_course_blueprint_id);
  }
}
