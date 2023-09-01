import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class AuthenticatedTeamRoute extends Route {
  @service currentUser;
  @service store;

  async model() {
    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    const members = await this.store.query('member', { certificationCenterId });
    const hasCleaHabilitation = (
      await this.store.peekRecord('allowed-certification-center-access', certificationCenterId)
    ).habilitations?.some((habilitation) => habilitation.key === 'CLEA');

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
