/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action, computed } from '@ember/object';
import { notEmpty, sort } from '@ember/object/computed';

const SORTING_ORDER = ['date:desc', 'time:desc'];

export default class SessionsListController extends Controller {
  @service currentUser;

  sortingOrder = SORTING_ORDER;

  @notEmpty('model') hasSession;

  @sort('model.[]', 'sortingOrder') sortedSessions;

  @action
  goToDetails(session) {
    this.transitionToRoute('authenticated.sessions.details', session.id);
  }

  @computed('currentUser.currentCertificationCenter.isScoManagingStudents')
  get shouldDisplayResultRecipientInfoMessage() {
    return !this.currentUser.currentCertificationCenter.isScoManagingStudents;
  }
}
