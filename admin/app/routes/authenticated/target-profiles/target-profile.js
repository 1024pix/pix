import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TargetProfileRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  model(params) {
    return this.store.findRecord('target-profile', params.target_profile_id);
  }
}
