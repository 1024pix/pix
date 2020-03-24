import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SessionController extends Controller {
  @service router;

  @action
  loadSession() {
    const sessionId = this.inputId;
    const routeName = this.router.currentRouteName;
    this.router.transitionTo(routeName, sessionId);
  }
}
