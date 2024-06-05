import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class TargetProfileDetailsRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model() {
    const model = this.modelFor('authenticated.target-profiles.target-profile');
    const areas = await model.areas;
    return { areas };
  }
}
