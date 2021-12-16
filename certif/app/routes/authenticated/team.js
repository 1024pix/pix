import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedTeamRoute extends Route {
  @service currentUser;

  model() {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    return this.store.query('member', { certificationCenterId });
  }
}
