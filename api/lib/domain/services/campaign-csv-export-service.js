const CampaignAssessmentCsvLine = require('../../infrastructure/utils/CampaignAssessmentCsvLine.js');
const csvSerializer = require('../../infrastructure/serializers/csv/csv-serializer.js');
const campaignParticipationService = require('../services/campaign-participation-service.js');

module.exports = {
  createOneCsvLine,
};

function createOneCsvLine({
  organization,
  campaign,
  campaignParticipationInfo,
  targetProfile,
  learningContent,
  stageCollection,
  participantKnowledgeElementsByCompetenceId,
  acquiredBadges,
  translate,
}) {
  const line = new CampaignAssessmentCsvLine({
    organization,
    campaign,
    campaignParticipationInfo,
    targetProfile,
    learningContent,
    stageCollection,
    participantKnowledgeElementsByCompetenceId,
    acquiredBadges,
    campaignParticipationService,
    translate,
  });

  return csvSerializer.serializeLine(line.toCsvLine());
}
