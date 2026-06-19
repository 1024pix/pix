import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class EditRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model(params) {
    const blueprint = await this.store.findRecord('combinedCourseBlueprint', params.combined_course_blueprint_id, {
      reload: true,
    });
    return { blueprint };
  }
}
