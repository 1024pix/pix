import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AssessmentRoute extends Route {
  @service currentUser;
  @service session;
  @service store;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model() {
    const campaign = this.modelFor('campaigns');
    const campaignParticipation = await this.store.queryRecord('campaign-participation', {
      campaignId: campaign.id,
      userId: this.currentUser.user.id,
    });
    return {
      assessment: await campaignParticipation.assessment,
      campaignParticipation,
      campaign,
    };
  }
}
