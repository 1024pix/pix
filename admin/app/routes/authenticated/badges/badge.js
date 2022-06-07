import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class BadgeRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  model(params) {
    return this.store.findRecord('badge', params.badge_id);
  }
}
