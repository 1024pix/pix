import CampaignAssessmentCsvLine from '../../infrastructure/utils/CampaignAssessmentCsvLine';
import csvSerializer from '../../infrastructure/serializers/csv/csv-serializer';
import campaignParticipationService from '../services/campaign-participation-service';

export default {
  createOneCsvLine,
};

function createOneCsvLine({
  organization,
  campaign,
  campaignParticipationInfo,
  targetProfile,
  learningContent,
  campaignStages,
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
    campaignStages,
    participantKnowledgeElementsByCompetenceId,
    acquiredBadges,
    campaignParticipationService,
    translate,
  });

  return csvSerializer.serializeLine(line.toCsvLine());
}
