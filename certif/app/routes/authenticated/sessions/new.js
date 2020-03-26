import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SessionsNewRoute extends Route {
  @service currentUser;

  model() {
    return this.store.createRecord('session', { certificationCenter: this.currentUser.certificationCenter });
  }

  deactivate() {
    if (this.controller.model.hasDirtyAttributes) {
      this.controller.model.deleteRecord();
    }
  }
}
