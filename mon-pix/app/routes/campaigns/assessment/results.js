import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class ResultsRoute extends Route {
  @service currentUser;
  @service session;
  @service store;
  @service router;
  @service featureToggles;
  @service requestManager;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  async model() {
    let questResults = [];
    const user = this.currentUser.user;
    const { campaignParticipation, campaign } = this.modelFor('campaigns.assessment');

    try {
      const campaignParticipationResult = await this.store.queryRecord('campaign-participation-result', {
        campaignId: campaign.id,
        userId: user.id,
      });

      if (!user.isAnonymous) {
        questResults = await this.store.query('quest-result', {
          campaignParticipationId: campaignParticipationResult.id,
        });
      }

      const trainings = await campaignParticipation.hasMany('trainings').reload();
      // Reload the user to display my trainings link on the navbar menu
      if (trainings?.length > 0 && !user.hasRecommendedTrainings) {
        await this.currentUser.load();
      }

      const hasAnsweredSurvey = campaign.recommendationEngine ? await this._hasAnsweredSurvey(campaign.id) : false;

      return {
        campaign,
        campaignParticipationResult,
        campaignParticipation,
        showTrainings: false,
        trainings,
        questResults,
        hasAnsweredSurvey,
      };
    } catch (error) {
      if (error.errors?.[0]?.status === '412') {
        this.router.transitionTo('campaigns.entry-point', campaign.code);
      } else throw error;
    }
  }

  async _hasAnsweredSurvey(campaignId) {
    try {
      const { content } = await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/campaigns/${campaignId}/has-answered-survey`,
        method: 'GET',
      });
      return content.hasAnswered;
    } catch {
      return false;
    }
  }
}
