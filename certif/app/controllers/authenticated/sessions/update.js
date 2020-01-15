import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class AuthenticatedSessionsUpdateController extends Controller {
  @action
  async updateSession(session) {
    await session.save();
    this.transitionToRoute('authenticated.sessions.details', session.id);
  }

  @action
  cancel(session) {
    this.transitionToRoute('authenticated.sessions.details', session.id);
  }
}
