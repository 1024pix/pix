const CampaignAssessmentCsvLine = require('../../infrastructure/utils/CampaignAssessmentCsvLine');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer');
const campaignParticipationService = require('../services/campaign-participation-service');

module.exports = {
  createOneCsvLine,
};

function createOneCsvLine({
  organization,
  campaign,
  campaignParticipationInfo,
  targetProfileWithLearningContent,
  participantKnowledgeElementsByCompetenceId,
  acquiredBadges,
  stages,
}) {
  const line = new CampaignAssessmentCsvLine({
    organization,
    campaign,
    campaignParticipationInfo,
    targetProfileWithLearningContent,
    stages,
    participantKnowledgeElementsByCompetenceId,
    acquiredBadges,
    campaignParticipationService,
  });

  return csvSerializer.serializeLine(line.toCsvLine());
}
