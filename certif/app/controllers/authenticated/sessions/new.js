import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class AuthenticatedSessionsNewController extends Controller {
  @action
  async createSession(session) {
    await session.save();
    this.transitionToRoute('authenticated.sessions.details', session.id);
  }

  @action
  cancel() {
    this.transitionToRoute('authenticated.sessions.list');
  }
}
