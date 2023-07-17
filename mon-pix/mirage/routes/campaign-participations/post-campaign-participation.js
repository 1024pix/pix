import { Response } from 'miragejs';

export default function (schema, request) {
  const params = JSON.parse(request.requestBody);

  const participantExternalId = params.data.attributes['participant-external-id'];

  if (participantExternalId && participantExternalId.length > 255) {
    return new Response(
      400,
      {},
      {
        errors: [
          {
            status: 400,
            detail: 'participant-external-id',
          },
        ],
      },
    );
  }

  const campaignId = params.data.relationships.campaign.data.id;

  const campaign = schema.campaigns.find(campaignId);

  if (campaign.code === 'FORBIDDEN') {
    return new Response(
      403,
      {},
      {
        errors: [{ status: 403 }],
      },
    );
  }

  if (campaign.type === 'PROFILES_COLLECTION') {
    return schema.campaignParticipations.create({ participantExternalId, campaign });
  }

  const newAssessment = {
    type: 'CAMPAIGN',
    codeCampaign: campaign.code,
  };

  const assessment = schema.assessments.create(newAssessment);
  return schema.campaignParticipations.create({ assessment, participantExternalId, campaign });
}
