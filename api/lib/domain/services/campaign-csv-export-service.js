const CampaignAssessmentCsvLine = require('../../infrastructure/utils/CampaignAssessmentCsvLine');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');
const campaignParticipationService = require('../services/campaign-participation-service');

module.exports = {
  createOneCsvLine,
};

function createOneCsvLine({
  organization,
  campaign,
  areas,
  competences,
  campaignParticipationInfo,
  targetProfile,
  participantKnowledgeElementsByCompetenceId,
}) {
  const line = new CampaignAssessmentCsvLine({
    organization,
    campaign,
    areas,
    competences,
    campaignParticipationInfo,
    targetProfile,
    participantKnowledgeElementsByCompetenceId,
    campaignParticipationService,
  });

  return csvSerializer.serializeLine(line.toCsvLine());
}
