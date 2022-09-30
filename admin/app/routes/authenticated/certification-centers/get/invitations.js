import Route from '@ember/routing/route';

export default class AuthenticatedCertificationCentersGetInvitationsRoute extends Route {
  async model() {
    const { certificationCenter } = this.modelFor('authenticated.certification-centers.get');
    const certificationCenterId = certificationCenter.id;
    return await this.store.query('certification-center-invitation', {
      filter: {
        certificationCenterId,
      },
    });
  }
}
