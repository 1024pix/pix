export default function(schema, request) {
  const params = JSON.parse(request.requestBody);

  const participantExternalId = params.data.attributes['participant-external-id'];
  const campaignId = params.data.relationships.campaign.data.id;

  const campaign = schema.campaigns.find(campaignId);

  const newAssessment = {
    type: 'SMART_PLACEMENT',
    codeCampaign: campaign.code,
  };

  const assessment = schema.assessments.create(newAssessment);
  return schema.campaignParticipations.create({ assessment, participantExternalId, campaign });
}
