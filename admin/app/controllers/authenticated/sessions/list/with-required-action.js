/* eslint-disable ember/no-computed-properties-in-native-classes */

import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { computed } from '@ember/object';

export default class AuthenticatedSessionsWithRequiredActionListController extends Controller {

  @service currentUser;

  @tracked assignedToSelfOnly = false;

  @computed('assignedToSelfOnly', 'currentUser.user.{fullName,id}', 'model')
  get filteredSessions() {
    const sessions = this.model;
    if (this.assignedToSelfOnly) {
      return sessions.filter((session) => session.assignedCertificationOfficerName === this.currentUser.user.fullName);
    }
    return sessions;
  }
}
