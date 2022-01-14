/* eslint-disable ember/no-controller-access-in-routes*/

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SessionsNewRoute extends Route {
  @service currentUser;

  beforeModel() {
    this.currentUser.checkRestrictedAccess();
  }

  model() {
    return this.store.createRecord('session', {
      certificationCenterId: parseInt(this.currentUser.currentAllowedCertificationCenterAccess.id),
    });
  }

  deactivate() {
    if (this.controller.model.hasDirtyAttributes) {
      this.controller.model.deleteRecord();
    }
  }
}
