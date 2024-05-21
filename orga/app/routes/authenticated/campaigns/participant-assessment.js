import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class AssessmentRoute extends Route {
  @service router;
  @service store;

  async model(params) {
    try {
      const { campaign_id: campaignId, campaign_participation_id: campaignParticipationId } = params;

      const campaignAssessmentParticipation = await this.store.queryRecord('campaign-assessment-participation', {
        campaignId,
        campaignParticipationId,
      });

      const availableCampaignParticipations = await this.store.query('available-campaign-participation', {
        campaignId,
        organizationLearnerId: campaignAssessmentParticipation.organizationLearnerId,
      });

      return await RSVP.hash({
        campaign: this.store.findRecord('campaign', campaignId),
        campaignAssessmentParticipation,
        availableCampaignParticipations,
      });
    } catch (error) {
      this.send('error', error, this.router.replaceWith('not-found', params.campaign_id));
    }
  }
}
