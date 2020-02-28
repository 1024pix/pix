import Controller from '@ember/controller';
import { action } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { sort } from '@ember/object/computed';
import config from '../../../config/environment';
import { debounce } from '@ember/runloop';

const SORTING_ORDER = ['date:desc', 'time:desc'];

export default class AuthenticatedSessionsListController extends Controller {
  @notEmpty('model') hasSession;
  @sort('model', 'sortingOrder') sortedSessions;

  queryParams = ['pageNumber', 'pageSize', 'name'];
  pageNumber = 1;
  pageSize = 25;
  searchFilter = null;
  examiner = null;

  constructor() {
    super(...arguments);
    this.isSessionFinalizationActive = config.APP.isSessionFinalizationActive;
    this.sortingOrder = SORTING_ORDER;
  }

  @action
  goToDetails(session) {
    this.transitionToRoute('authenticated.sessions.details', session);
  }

  @action
  triggerFiltering(fieldName, value) {
    this.set('searchFilter', { fieldName, value });
    debounce(this, this.setFieldName, 500);
  }
}
