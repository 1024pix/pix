import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TargetProfileDetailsRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model() {
    return this.modelFor('authenticated.target-profiles.target-profile');
  }
}
