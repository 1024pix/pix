import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';

export default class AuthenticatedSessionsWithRequiredActionListController extends Controller {
  @tracked v2sessionsOnly = false;

  @computed('v2sessionsOnly', 'model')
  get filteredSessions() {
    const sessions = this.model;
    const versionNumber = 2;
    if (this.v2sessionsOnly) {
      return sessions.filter((session) => session.version === versionNumber);
    }
    return sessions;
  }
}
