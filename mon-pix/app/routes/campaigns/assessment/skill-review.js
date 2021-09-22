import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SkillReviewRoute extends Route {
  @service store;
  @service session;
  @service currentUser;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model() {
    const user = this.currentUser.user;
    const campaign = this.modelFor('campaigns');
    try {
      const campaignParticipationResult = await this.store.queryRecord('campaignParticipationResult', {
        campaignId: campaign.id,
        userId: user.id,
      });
      return { campaign, campaignParticipationResult };
    } catch (error) {
      if (error.errors?.[0]?.status === '412') {
        return this.transitionTo('campaigns.entry-point', campaign.code);
      } else throw error;
    }
  }
}
