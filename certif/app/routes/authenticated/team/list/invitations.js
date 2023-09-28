import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedTeamListInvitationsRoute extends Route {
  @service currentUser;
  @service router;

  beforeModel() {
    if (!this.currentUser.isAdminOfCurrentCertificationCenter) {
      this.router.replaceWith('authenticated.team.list.members');
    }
  }

  model() {
    return this.modelFor('authenticated.team.list').invitations;
  }
}
