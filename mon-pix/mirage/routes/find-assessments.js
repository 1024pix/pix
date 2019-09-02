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
