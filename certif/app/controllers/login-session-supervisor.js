import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class LoginSessionSupervisorController extends Controller {
  @service store;
  @service router;
  @service currentUser;
  @service notifications;

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
      return this.router.transitionTo('session-supervising', sessionId);
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    } finally {
      supervisorAuthentication.unloadRecord();
    }
  }
}
