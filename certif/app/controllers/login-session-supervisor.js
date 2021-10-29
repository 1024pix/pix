import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class LoginSessionSupervisor extends Controller {
  @service router;

  @action
  async authorize(sessionId) {
    return this.router.transitionTo('session-supervising', sessionId);
  }
}
