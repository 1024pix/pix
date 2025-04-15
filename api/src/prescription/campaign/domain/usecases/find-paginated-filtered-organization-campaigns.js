import { withTransaction } from '../../../../shared/domain/DomainTransaction.js';
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
    const campaignParticipationIds = await campaignParticipationRepository.getSharedParticipationIds(campaignReport.id);

    const knowledgeElementsByParticipation =
      await knowledgeElementSnapshotRepository.findByCampaignParticipationIds(campaignParticipationIds);

    const learningContent = await learningContentRepository.findByCampaignId(campaignReport.id, locale);
    const campaignResultLevelPerTubesAndCompetences = new CampaignResultLevelsPerTubesAndCompetences({
      campaignId: campaignReport.id,
      learningContent,
      knowledgeElementsByParticipation,
    });
    campaignReport.setCoverRate(campaignResultLevelPerTubesAndCompetences);
  }
  return campaignReports;
});

export { findPaginatedFilteredOrganizationCampaigns };
