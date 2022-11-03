import Route from '@ember/routing/route';

export default class AuthenticatedCertificationCentersGetInvitationsRoute extends Route {
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
