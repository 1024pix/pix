import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class AssessmentRoute extends Route {

  model(params) {
    const { 'campaign_id': campaignId, 'campaign_participation_id': campaignParticipationId } = params;
    return RSVP.hash({
      campaign: this.store.findRecord('campaign', campaignId),
      campaignAssessmentParticipation: this.store.queryRecord('campaign-assessment-participation', { campaignId, campaignParticipationId }),
    });
  }
}
