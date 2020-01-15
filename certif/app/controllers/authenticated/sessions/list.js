import Controller from '@ember/controller';
import { notEmpty } from '@ember/object/computed';
import config from '../../../config/environment';
import { action } from '@ember/object';

export default class AuthenticatedSessionsListController extends Controller {
  @notEmpty('model') hasSession;

  constructor() {
    super(...arguments);
    this.isSessionFinalizationActive = config.APP.isSessionFinalizationActive;
  }

  @action
  goToDetails(sessionId) {
    this.transitionToRoute('authenticated.sessions.details', sessionId);
  }
}
