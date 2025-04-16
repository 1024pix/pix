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
            title: 'Bad Request',
            detail:
              '"data.attributes.participant-external-id" length must be less than or equal to 255 characters long',
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
    hasCheckpoints: campaign.type === 'ASSESSMENT',
    showProgressBar: campaign.type === 'ASSESSMENT',
    showLevelup: campaign.type === 'ASSESSMENT',
    showQuestionCounter: campaign.type === 'ASSESSMENT',
  };

  const assessment = schema.assessments.create(newAssessment);
  return schema.campaignParticipations.create({ assessment, participantExternalId, campaign });
}
