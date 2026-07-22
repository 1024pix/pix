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
  knowledgeElementSnapshotRepository,
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
        knowledgeElementSnapshotRepository,
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
  { campaignParticipationRepository, knowledgeElementSnapshotRepository, learningContentRepository },
) {
  const campaignParticipationIds = await campaignParticipationRepository.getSharedParticipationIds(campaignReportId);
  const campaignParticipationIdsChunks = _.chunk(campaignParticipationIds, CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING);

  const learningContent = await learningContentRepository.findByCampaignId(campaignReportId, locale);
  const campaignResultLevelPerTubesAndCompetences = new CampaignResultLevelsPerTubesAndCompetences({
    id: campaignReportId,
    learningContent,
  });

  for (const chunk of campaignParticipationIdsChunks) {
    const knowledgeElementsByParticipation =
      await knowledgeElementSnapshotRepository.findByCampaignParticipationIds(chunk);
    campaignResultLevelPerTubesAndCompetences.addKnowledgeElementSnapshots(knowledgeElementsByParticipation);
  }

  return campaignResultLevelPerTubesAndCompetences;
}
