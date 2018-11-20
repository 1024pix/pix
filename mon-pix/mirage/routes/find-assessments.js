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

  const courseId = request.queryParams['filter[courseId]'];
  const type = request.queryParams['filter[type]'];
  const state = request.queryParams['filter[state]'];

  if(['CERTIFICATION', 'PLACEMENT'].includes(type) && courseId) {
    return schema.assessments.where({ courseId, type, state });
  }

  return schema.assessments.all();
}
