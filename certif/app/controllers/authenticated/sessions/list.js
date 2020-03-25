import Controller from '@ember/controller';
import { action } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { sort } from '@ember/object/computed';
import config from '../../../config/environment';

const SORTING_ORDER = ['date:desc', 'time:desc'];

export default class SessionsListController extends Controller {
  isSessionFinalizationActive = config.APP.isSessionFinalizationActive;
  sortingOrder = SORTING_ORDER;

  @notEmpty('model') hasSession;
  @sort('model', 'sortingOrder') sortedSessions;

  @action
  goToDetails(session) {
    this.transitionToRoute('authenticated.sessions.details', session);
  }
}
