import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TrainingDetailsRoute extends Route {
  @service accessControl;
  @service store;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated');
  }

  async model() {}
}
