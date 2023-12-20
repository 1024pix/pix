import Route from '@ember/routing/route';
import { service } from '@ember/service';
export default class NewRoute extends Route {
  @service accessControl;
  @service store;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model() {
    const autonomousCourse = await this.store.createRecord('autonomous-course');
    const targetProfiles = await this.store.findAll('autonomous-course-target-profile');
    return { autonomousCourse, targetProfiles };
  }
}
