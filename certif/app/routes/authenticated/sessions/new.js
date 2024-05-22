import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SessionsNewRoute extends Route {
  @service currentUser;
  @service store;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  model() {
    return this.store.createRecord('session-enrolment', {
      certificationCenterId: parseInt(this.currentUser.currentAllowedCertificationCenterAccess.id),
    });
  }

  resetController(controller) {
    if (controller.model.hasDirtyAttributes) {
      controller.model.deleteRecord();
    }
  }
}
