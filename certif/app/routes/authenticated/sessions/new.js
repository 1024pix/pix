import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SessionsNewRoute extends Route {
  @service currentUser;

  model() {
    return this.store.createRecord('session', { certificationCenterId: this.currentUser.certificationPointOfContact.certificationCenterId });
  }

  deactivate() {
    if (this.controller.model.hasDirtyAttributes) {
      this.controller.model.deleteRecord();
    }
  }
}
