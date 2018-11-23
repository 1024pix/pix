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

  const type = request.queryParams['filter[type]'];
  const courseId = request.queryParams['filter[courseId]'];

  if (type === 'CERTIFICATION' && courseId) {
    return schema.assessments.where({ courseId, type });
  }

  const state = request.queryParams['filter[state]'];

  if (type === 'PLACEMENT' && courseId && state === 'started') {
    return schema.assessments.where({ courseId, type, state });
  }

  return schema.assessments.all();
}
