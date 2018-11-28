export default function(schema, request) {

  const campaignCode = request.queryParams['filter[codeCampaign]'];

  if (campaignCode) {
    const campaign = schema.campaigns.findBy({ code: campaignCode });

    if (campaign) {
      const assessment = schema.campaignParticipations.findBy({ campaignId: campaign.id });

      if (assessment) {
        return schema.assessments.where({ id: assessment.id });
      }
    }
  }

  return schema.assessments.all();
}
