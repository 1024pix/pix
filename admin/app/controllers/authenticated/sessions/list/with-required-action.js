import Controller from '@ember/controller';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { action, computed } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class AuthenticatedSessionsWithRequiredActionListController extends Controller {
  @service currentUser;

  @tracked assignedToSelfOnly = false;

  @computed('assignedToSelfOnly', 'currentUser.adminMember.fullName', 'model.withRequiredAction')
  get sessionsList() {
    const sessions = this.model;
    if (this.assignedToSelfOnly) {
      return sessions.filter(
        (session) => session.assignedCertificationOfficerName === this.currentUser.adminMember.fullName,
      );
    }
    return sessions;
  }

  get hasSessionsToProcess() {
    return Boolean(this.model?.length);
  }

  @action toggleAssignedSessionsDisplay() {
    this.assignedToSelfOnly = !this.assignedToSelfOnly;
    this.sessionsList;
  }
}
