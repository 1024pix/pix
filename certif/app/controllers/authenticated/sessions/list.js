/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Controller from '@ember/controller';
import { action, computed } from '@ember/object';
import { notEmpty, sort } from '@ember/object/computed';
import config from 'pix-certif/config/environment';

const SORTING_ORDER = ['date:desc', 'time:desc'];

export default class SessionsListController extends Controller {
  isResultRecipientEmailVisible = config.APP.FT_IS_AUTO_SENDING_OF_CERTIF_RESULTS;

  sortingOrder = SORTING_ORDER;

  @notEmpty('model') hasSession;

  @sort('model.[]', 'sortingOrder') sortedSessions;

  @action
  goToDetails(session) {
    this.transitionToRoute('authenticated.sessions.details', session.id);
  }

  @computed('isResultRecipientEmailVisible')
  get shouldDisplayResultRecipientInfoMessage() {
    return this.isResultRecipientEmailVisible === true;
  }
}
