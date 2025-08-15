import { archiveCampaign } from './archive-campaign.js';
import { archiveCampaigns } from './archive-campaigns.js';
import { computeCampaignCollectiveResult } from './compute-campaign-collective-result.js';
import { createCampaign } from './create-campaign.js';
import { createCampaigns } from './create-campaigns.js';
import { deleteCampaigns } from './delete-campaigns.js';
import { findAssessmentParticipationResultList } from './find-assessment-participation-result-list.js';
import { findCampaignProfilesCollectionParticipationSummaries } from './find-campaign-profiles-collection-participation-summaries.js';
import { findCampaignSkillIdsForCampaignParticipations } from './find-campaign-skill-ids-for-campaign-participations.js';
import { findPaginatedCampaignManagements } from './find-paginated-campaign-managements.js';
import { findPaginatedCampaignParticipantsActivities } from './find-paginated-campaign-participants-activities.js';
import { findPaginatedFilteredOrganizationCampaigns } from './find-paginated-filtered-organization-campaigns.js';
import { getCampaign } from './get-campaign.js';
import { getCampaignByCode } from './get-campaign-by-code.js';
import { getCampaignManagement } from './get-campaign-management.js';
import { getCampaignOfCampaignParticipation } from './get-campaign-of-campaign-participation.js';
import { getCampaignParticipations } from './get-campaign-participations.js';
import { getKnowledgeElementSnapshotForParticipation } from './get-knowledge-element-snapshot-for-participation.js';
import { getParticipantsDivision } from './get-participants-division.js';
import { getParticipantsGroup } from './get-participants-group.js';
import { getPresentationSteps } from './get-presentation-steps.js';
import { getResultLevelsPerTubesAndCompetences } from './get-result-levels-per-tubes-and-competences.js';
import { getTargetProfile } from './get-target-profile.js';
import { saveKnowledgeElementSnapshotForParticipation } from './save-knowledge-element-snapshot-for-participation.js';
import { startWritingCampaignAssessmentResultsToStream } from './start-writing-campaign-assessment-results-to-stream.js';
import { startWritingCampaignProfilesCollectionResultsToStream } from './start-writing-campaign-profiles-collection-results-to-stream.js';
import { getBadgeAcquisitionsStatistics } from './statistics/get-badge-acquisitions-statistics.js';
import { getCampaignParticipationsActivityByDay } from './statistics/get-campaign-participations-activity-by-day.js';
import { getCampaignParticipationsCountByStage } from './statistics/get-campaign-participations-counts-by-stage.js';
import { getCampaignParticipationsCountsByStatus } from './statistics/get-campaign-participations-counts-by-status.js';
import { getParticipationsCountByMasteryRate } from './statistics/get-participations-count-by-mastery-rate.js';
import { swapCampaignCodes } from './swap-campaign-code.js';
import { unarchiveCampaign } from './unarchive-campaign.js';
import { updateCampaign } from './update-campaign.js';
import { updateCampaignCode } from './update-campaign-code.js';
import { updateCampaignDetails } from './update-campaign-details.js';

const usecases = {
  archiveCampaign,
  archiveCampaigns,
  computeCampaignCollectiveResult,
  createCampaign,
  createCampaigns,
  deleteCampaigns,
  findAssessmentParticipationResultList,
  findCampaignProfilesCollectionParticipationSummaries,
  findCampaignSkillIdsForCampaignParticipations,
  findPaginatedCampaignManagements,
  findPaginatedCampaignParticipantsActivities,
  findPaginatedFilteredOrganizationCampaigns,
  getCampaignByCode,
  getCampaignManagement,
  getCampaignOfCampaignParticipation,
  getCampaignParticipations,
  getCampaign,
  getKnowledgeElementSnapshotForParticipation,
  getParticipantsDivision,
  getParticipantsGroup,
  getPresentationSteps,
  getResultLevelsPerTubesAndCompetences,
  getTargetProfile,
  saveKnowledgeElementSnapshotForParticipation,
  startWritingCampaignAssessmentResultsToStream,
  startWritingCampaignProfilesCollectionResultsToStream,
  swapCampaignCodes,
  unarchiveCampaign,
  updateCampaignCode,
  updateCampaignDetails,
  updateCampaign,
  getBadgeAcquisitionsStatistics,
  getCampaignParticipationsActivityByDay,
  getCampaignParticipationsCountByStage,
  getCampaignParticipationsCountsByStatus,
  getParticipationsCountByMasteryRate,
};

export { usecases };
