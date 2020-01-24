import Controller from '@ember/controller';
import { action } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { sort } from '@ember/object/computed';
import config from '../../../config/environment';

const SORTING_ORDER = ['date:desc', 'time:desc'];

export default class AuthenticatedSessionsListController extends Controller {
  @notEmpty('model') hasSession;
  @sort('model', 'sortingOrder') sortedSessions;

  constructor() {
    super(...arguments);
    this.isSessionFinalizationActive = config.APP.isSessionFinalizationActive;
    this.sortingOrder = SORTING_ORDER;
  }

  @action
  goToDetails(session) {
    this.transitionToRoute('authenticated.sessions.details', session);
  }
}
