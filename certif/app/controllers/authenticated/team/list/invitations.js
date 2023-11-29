import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class AuthenticatedTeamListInvitationsController extends Controller {
  @action
  async cancelInvitation(certificationCenterInvitation) {
    await certificationCenterInvitation.destroyRecord();
  }
}
