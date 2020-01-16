import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class AuthenticatedSessionsNewController extends Controller {
  @action
  async createSession(event) {
    event.preventDefault();
    await this.model.save();
    this.transitionToRoute('authenticated.sessions.details', this.model.id);
  }

  @action
  cancel() {
    this.transitionToRoute('authenticated.sessions.list');
  }
}
