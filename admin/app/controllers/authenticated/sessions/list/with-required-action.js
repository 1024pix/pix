import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';

export default class AuthenticatedSessionsWithRequiredActionListController extends Controller {
  @service currentUser;

  @tracked assignedToSelfOnly = false;

  @computed('assignedToSelfOnly', 'currentUser.adminMember.fullName', 'model')
  get filteredSessions() {
    const sessions = this.model;
    if (this.assignedToSelfOnly) {
      return sessions.filter(
        (session) => session.assignedCertificationOfficerName === this.currentUser.adminMember.fullName,
      );
    }
    return sessions;
  }
}
