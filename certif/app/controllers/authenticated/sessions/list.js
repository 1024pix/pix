import Controller from '@ember/controller';
import { action } from '@ember/object';
import { notEmpty, sort } from '@ember/object/computed';

const SORTING_ORDER = ['date:desc', 'time:desc'];

export default class SessionsListController extends Controller {
  sortingOrder = SORTING_ORDER;

  @notEmpty('model') hasSession;

  @sort('model.[]', 'sortingOrder') sortedSessions;

  @action
  goToDetails(session) {
    this.transitionToRoute('authenticated.sessions.details', session.id);
  }
}
