import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ListRoute extends Route {
  @service accessControl;
  @service store;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin'], 'authenticated');
  }

  async model() {
    return this.store.findAll('admin-member');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('inviteErrorRaised', null);
    }
  }
}
