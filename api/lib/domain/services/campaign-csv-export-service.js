import { CampaignAssessmentCsvLine } from '../../infrastructure/utils/CampaignAssessmentCsvLine.js';
import * as csvSerializer from '../../infrastructure/serializers/csv/csv-serializer.js';
import * as campaignParticipationService from '../services/campaign-participation-service.js';

export { createOneCsvLine };

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
