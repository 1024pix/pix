import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LoginSessionSupervisorController extends Controller {
  @service store;
  @service router;
  @service currentUser;

  get currentUserEmail() {
    return this.currentUser.certificationPointOfContact.email;
  }

  @action
  async authenticateSupervisor({ sessionId, supervisorPassword }) {
    const supervisorAuthentication = this.store.createRecord('supervisor-authentication', {
      id: sessionId,
      sessionId,
      supervisorPassword,
    });
    try {
      await supervisorAuthentication.save();
    } finally {
      supervisorAuthentication.unloadRecord();
    }
    return this.router.transitionTo('session-supervising', sessionId);
  }
}
