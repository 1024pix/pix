import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ListRoute extends Route {
  @service accessControl;
  @service store;

  beforeModel() {
    this.accessControl.restrictAccessTo(['isSuperAdmin'], 'authenticated');
  }

  async model() {
    this.store.unloadAll('admin-member');
    return this.store.findAll('admin-member');
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('inviteErrorRaised', null);
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
