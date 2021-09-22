import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class FillInParticipantExternalIdRoute extends Route {

  @service session;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model() {
    return this.modelFor('campaigns');
  }
}
