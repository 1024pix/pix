import { beginCampaignParticipationImprovement } from './begin-campaign-participation-improvement.js';
import { computeCampaignParticipationAnalysis } from './compute-campaign-participation-analysis.js';
import { deleteCampaignParticipation } from './delete-campaign-participation.js';
import { findCampaignParticipationsForUserManagement } from './find-campaign-participations-for-user-management.js';
import { findPaginatedParticipationsForCampaignManagement } from './find-paginated-participations-for-campaign-management.js';
import { findUserAnonymisedCampaignAssessments } from './find-user-anonymised-campaign-assessments.js';
import { findUserCampaignParticipationOverviews } from './find-user-campaign-participation-overviews.js';
import { getCampaignAssessmentParticipation } from './get-campaign-assessment-participation.js';
import { getCampaignAssessmentParticipationResult } from './get-campaign-assessment-participation-result.js';
import { getCampaignParticipationsForOrganizationLearner } from './get-campaign-participations-for-organization-learner.js';
import { getCampaignProfile } from './get-campaign-profile.js';
import { getPoleEmploiSendings } from './get-pole-emploi-sendings.js';
import { getSharedCampaignParticipationProfile } from './get-shared-campaign-participation-profile.js';
import { getUserCampaignAssessmentResult } from './get-user-campaign-assessment-result.js';
import { getUserCampaignParticipationToCampaign } from './get-user-campaign-participation-to-campaign.js';
import { hasCampaignParticipations } from './has-campaign-participations.js';
import { saveComputedCampaignParticipationResult } from './save-computed-campaign-participation-result.js';
import { sendCompletedParticipationResultsToPoleEmploi } from './send-completed-participation-results-to-pole-emploi.js';
import { sendSharedParticipationResultsToPoleEmploi } from './send-shared-participation-results-to-pole-emploi.js';
import { sendStartedParticipationResultsToPoleEmploi } from './send-started-participation-results-to-pole-emploi.js';
import { shareCampaignResult } from './share-campaign-result.js';
import { startCampaignParticipation } from './start-campaign-participation.js';
import { updateParticipantExternalId } from './update-participant-external-id.js';

const usecases = {
  beginCampaignParticipationImprovement,
  computeCampaignParticipationAnalysis,
  deleteCampaignParticipation,
  findCampaignParticipationsForUserManagement,
  findPaginatedParticipationsForCampaignManagement,
  findUserAnonymisedCampaignAssessments,
  findUserCampaignParticipationOverviews,
  getCampaignAssessmentParticipationResult,
  getCampaignAssessmentParticipation,
  getCampaignParticipationsForOrganizationLearner,
  getCampaignProfile,
  getPoleEmploiSendings,
  getSharedCampaignParticipationProfile,
  getUserCampaignAssessmentResult,
  getUserCampaignParticipationToCampaign,
  hasCampaignParticipations,
  saveComputedCampaignParticipationResult,
  sendCompletedParticipationResultsToPoleEmploi,
  sendSharedParticipationResultsToPoleEmploi,
  sendStartedParticipationResultsToPoleEmploi,
  shareCampaignResult,
  startCampaignParticipation,
  updateParticipantExternalId,
};

export { usecases };
