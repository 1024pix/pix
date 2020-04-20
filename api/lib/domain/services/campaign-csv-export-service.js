const CampaignAssessmentCsvLine = require('../../infrastructure/utils/CampaignAssessmentCsvLine');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');
const campaignParticipationService = require('../services/campaign-participation-service');

module.exports = {
  createOneCsvLine,
};

function createOneCsvLine({
  organization,
  campaign,
  competences,
  campaignParticipationResultData,
  targetProfile,
  participantKnowledgeElements,
}) {
  const line = new CampaignAssessmentCsvLine({
    organization,
    campaign,
    competences,
    campaignParticipationResultData,
    targetProfile,
    participantKnowledgeElements,
    campaignParticipationService,
  });

  return csvSerializer.serializeLine(line.toCsvLine());
}
