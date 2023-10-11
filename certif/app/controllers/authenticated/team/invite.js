import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class AuthenticatedTeamInviteController extends Controller {
  @service router;

  @action
  async createCertificationCenterInvitation(event) {
    event.preventDefault();
  }

  @action
  updateEmail() {}

  @action
  cancel() {
    this.router.transitionTo('authenticated.team.list.invitations');
  }
}
