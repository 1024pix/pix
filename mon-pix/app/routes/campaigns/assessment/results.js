import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ResultsRoute extends Route {
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
      const campaignParticipationResult = await this.store.queryRecord('campaign-participation-result', {
        campaignId: campaign.id,
        userId: user.id,
      });

      const questResults = await this.store.query('quest-result', {
        campaignParticipationId: campaignParticipationResult.id,
      });

      const trainings = await campaignParticipation.hasMany('trainings').reload();

      // Reload the user to display my trainings link on the navbar menu
      if (trainings?.length > 0 && !user.hasRecommendedTrainings) {
        await this.currentUser.load();
      }

      return { campaign, campaignParticipationResult, trainings, questResults };
    } catch (error) {
      if (error.errors?.[0]?.status === '412') {
        this.router.transitionTo('campaigns.entry-point', campaign.code);
      } else throw error;
    }
  }
}
