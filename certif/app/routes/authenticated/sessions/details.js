import Route from '@ember/routing/route';

export default class SessionsDetailsRoute extends Route {
  async model(params) {
    const session = await this.store.findRecord('session', params.session_id);
    await session.certificationCandidates;
    const certificationCenter = this.modelFor('authenticated');
    const featureToggles = this.store.peekRecord('feature-toggle', 0);
    const isCertifPrescriptionScoEnabled = featureToggles.certifPrescriptionSco;

    return {
      session,
      isCertificationCenterSco: certificationCenter.isSco,
      isCertifPrescriptionScoEnabled,
    };
  }
}
