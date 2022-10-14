import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class AuthenticatedTeamRoute extends Route {
  @service currentUser;

  model() {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    const members = this.store.query('member', { certificationCenterId });
    const hasCleaHabilitation = this.store
      .peekRecord('allowed-certification-center-access', certificationCenterId)
      .habilitations?.some((habilitation) => habilitation.key === 'CLEA');

    return {
      members,
      hasCleaHabilitation,
    };
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
