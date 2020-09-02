import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  links(campaignAssessmentParticipation) {
    return {
      campaignAssessmentParticipationResult: {
        related: `/api/campaigns/${campaignAssessmentParticipation.campaignId}/assessment-participations/${campaignAssessmentParticipation.id}/results`,
      },
      campaignAnalysis: {
        related: `/api/campaign-participations/${campaignAssessmentParticipation.id}/analyses`,
      },
    };
  }
});
