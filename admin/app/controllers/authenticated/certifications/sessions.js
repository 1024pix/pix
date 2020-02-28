import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SessionsController extends Controller {

  @tracked sessionId = null;
  loading = false;

  @service router;

  @action
  onLoadSession(id) {
    this.sessionId = id;
    switch (this.router.currentRouteName) {
      case 'authenticated.certifications.sessions.info.list':
        this.transitionToRoute('authenticated.certifications.sessions.info.list', id);
        break;
      case 'authenticated.certifications.sessions.info':
      default:
        this.transitionToRoute('authenticated.certifications.sessions.info', id);
        break;
    }
  }
}
