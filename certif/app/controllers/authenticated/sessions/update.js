import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class AuthenticatedSessionsUpdateController extends Controller {
  @action
  async updateSession(event) {
    event.preventDefault();
    await this.model.save();
    this.transitionToRoute('authenticated.sessions.details', this.model.id);
  }

  @action
  cancel() {
    this.transitionToRoute('authenticated.sessions.details', this.model.id);
  }
}
