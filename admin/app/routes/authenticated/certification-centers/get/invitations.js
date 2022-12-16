import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AuthenticatedCertificationCentersGetInvitationsRoute extends Route {
  @service store;

  async model() {
    this.store.unloadAll('certification-center-invitation');
    const { certificationCenter } = this.modelFor('authenticated.certification-centers.get');
    const certificationCenterId = certificationCenter.id;

    const certificationCenterInvitations = await this.store.findAll('certification-center-invitation', {
      adapterOptions: { certificationCenterId },
    });
    return { certificationCenterId, certificationCenterInvitations };
  }
}
