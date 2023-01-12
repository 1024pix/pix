import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SkillReviewRoute extends Route {
  @service currentUser;
  @service session;
  @service store;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model() {
    const user = this.currentUser.user;
    const { campaignParticipation, campaign } = this.modelFor('campaigns.assessment');
    try {
      const campaignParticipationResult = await this.store.queryRecord('campaignParticipationResult', {
        campaignId: campaign.id,
        userId: user.id,
      });
      const trainings = await campaignParticipation.hasMany('trainings').reload();

      // Reload the user to display my trainings link on the navbar menu
      if (trainings?.length > 0 && !user.hasRecommendedTrainings) {
        await this.currentUser.load();
      }
      return { campaign, campaignParticipationResult, trainings };
    } catch (error) {
      if (error.errors?.[0]?.status === '412') {
        this.router.transitionTo('campaigns.entry-point', campaign.code);
        return;
      } else throw error;
    }
  }
}
