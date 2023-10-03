import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class AuthenticatedTeamListRoute extends Route {
  @service currentUser;
  @service store;

  async model() {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    let invitations = [];
    const members = this.store.query('member', { certificationCenterId });

    if (this.currentUser.isAdminOfCurrentCertificationCenter) {
      invitations = await this.store.findAll('certification-center-invitation', {
        adapterOptions: { certificationCenterId },
      });
    }

    const hasCleaHabilitation = this.store
      .peekRecord('allowed-certification-center-access', certificationCenterId)
      .habilitations?.some((habilitation) => habilitation.key === 'CLEA');

    return {
      invitations,
      members,
      hasCleaHabilitation,
    };
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
