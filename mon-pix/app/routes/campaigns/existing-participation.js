import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ExistingParticipation extends Route {
  @service store;
  @service currentUser;
  @service session;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model() {
    const { code } = this.paramsFor('campaigns');
    return this.store.queryRecord('organization-learner-identity', {
      userId: this.currentUser.user.id,
      campaignCode: code,
    });
  }
}
