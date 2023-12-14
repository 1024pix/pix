import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class AuthenticatedTeamListMembersController extends Controller {
  @service currentUser;
  @service store;

  @action
  async leaveCertificationCenter() {
    await this.store
      .adapterFor('member')
      .leaveCertificationCenter(this.currentUser.currentAllowedCertificationCenterAccess.id);
  }
}
