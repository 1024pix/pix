import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default class AssessmentRoute extends Route {
  @service router;

  async model(params) {
    try {
      const { campaign_id: campaignId, campaign_participation_id: campaignParticipationId } = params;
      return await RSVP.hash({
        campaign: this.store.findRecord('campaign', campaignId),
        campaignAssessmentParticipation: this.store.queryRecord('campaign-assessment-participation', {
          campaignId,
          campaignParticipationId,
        }),
      });
    } catch (error) {
      this.send('error', error, this.router.replaceWith('not-found', params.campaign_id));
    }
  }
}
