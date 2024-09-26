import * as campaignParticipationService from '../../../../../lib/domain/services/campaign-participation-service.js';
import * as csvSerializer from '../../../../shared/infrastructure/serializers/csv/csv-serializer.js';
import { CampaignAssessmentCsvLine } from '../../infrastructure/utils/CampaignAssessmentCsvLine.js';

export { createOneCsvLine };

function createOneCsvLine({
  organization,
  campaign,
  additionalHeaders,
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
    additionalHeaders,
    learningContent,
    stageCollection,
    participantKnowledgeElementsByCompetenceId,
    acquiredBadges,
    campaignParticipationService,
    translate,
  });

  return csvSerializer.serializeLine(line.toCsvLine());
}
