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
  const resumable = request.queryParams['filter[resumable]'];

  if (type === 'CERTIFICATION' && courseId && resumable === 'true') {
    return schema.assessments.where({ courseId, type });
  }

  if (type === 'PLACEMENT' && courseId && resumable === 'true') {
    return schema.assessments.where({ courseId, type, state: 'started' });
  }

  return schema.assessments.all();
}
