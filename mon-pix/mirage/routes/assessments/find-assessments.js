import { Response } from 'ember-cli-mirage';

export default function(schema, request) {
  const campaignCode = request.queryParams['filter[codeCampaign]'];
  if (!campaignCode) {
    return new Response(500);
  }
  
  const campaign = schema.campaigns.findBy((campaign) => {
    return campaign.code.toLowerCase() === campaignCode.toLowerCase();
  });
  if (!campaign) {
    return new Response(500);
  }

  const campaignParticipation = schema.campaignParticipations.findBy({ campaignId: campaign.id });
  if (campaignParticipation) {
    return schema.assessments.where({ id: campaignParticipation.assessmentId });
  }
  return new Response(200, {}, { data: [] });
}
