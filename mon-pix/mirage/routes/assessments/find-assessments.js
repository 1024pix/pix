import { Response } from 'ember-cli-mirage';

export default function(schema, request) {
  const campaignCode = request.queryParams['filter[codeCampaign]'];
  if (campaignCode) {
    const campaign = schema.campaigns.findBy({ code: campaignCode });

    if (campaign) {
      const campaignParticipation = schema.campaignParticipations.findBy({ campaignId: campaign.id });

      if (campaignParticipation) {
        return schema.assessments.where({ id: campaignParticipation.assessmentId });
      }
    }
  }

  return new Response(500);
}
