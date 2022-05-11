import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
export default class NewRoute extends Route {
  @service store;
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  model() {
    return this.store.createRecord('organization');
  }
}
