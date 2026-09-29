import _ from 'lodash';

import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING } from '../constants.js';
import { CampaignResultLevelsPerTubesAndCompetences } from '../models/CampaignResultLevelsPerTubesAndCompetences.js';

const findPaginatedFilteredOrganizationCampaigns = withTransaction(async function ({
  locale,
  userId,
  organizationId,
  filter,
  page,
  campaignReportRepository,
  campaignParticipationRepository,
  learningContentRepository,
  knowledgeStateSnapshotRepository,
  withCoverRate,
}) {
  const campaignReports = await campaignReportRepository.findPaginatedFilteredByOrganizationId({
    organizationId,
    filter,
    page,
    userId,
  });

  if (!withCoverRate) {
    return campaignReports;
  }

  for (const campaignReport of campaignReports.models) {
    if (campaignReport.canComputeCoverRate) {
      const coverRate = await computeCoverRate(campaignReport.id, locale, {
        campaignParticipationRepository,
        knowledgeStateSnapshotRepository,
        learningContentRepository,
      });
      campaignReport.setCoverRate(coverRate);
    }
  }
  return campaignReports;
});

export { findPaginatedFilteredOrganizationCampaigns };

async function computeCoverRate(
  campaignReportId,
  locale,
  { campaignParticipationRepository, knowledgeStateSnapshotRepository, learningContentRepository },
) {
  const campaignParticipationIds = await campaignParticipationRepository.getSharedParticipationIds(campaignReportId);
  const campaignParticipationIdsChunks = _.chunk(campaignParticipationIds, CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);

  const learningContent = await learningContentRepository.findByCampaignId(campaignReportId, locale);
  const campaignResultLevelPerTubesAndCompetences = new CampaignResultLevelsPerTubesAndCompetences({
    id: campaignReportId,
    learningContent,
  });

  for (const chunk of campaignParticipationIdsChunks) {
    const knowledgeStatesByParticipation = await knowledgeStateSnapshotRepository.findByCampaignParticipationIds(chunk);
    campaignResultLevelPerTubesAndCompetences.addKnowledgeStates(knowledgeStatesByParticipation);
  }

  return campaignResultLevelPerTubesAndCompetences;
}
