import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SessionsDetailsRoute extends Route {
  @service currentUser;

  async model(params) {
    const session = await this.store.findRecord('session', params.session_id);
    await session.certificationCandidates;
    const isUserFromSco = this.currentUser.isFromSco;
    const featureToggles = this.store.peekRecord('feature-toggle', 0);
    const isCertifPrescriptionScoEnabled = featureToggles.certifPrescriptionSco;

    return {
      session,
      isUserFromSco,
      isCertifPrescriptionScoEnabled,
    };
  }
}
