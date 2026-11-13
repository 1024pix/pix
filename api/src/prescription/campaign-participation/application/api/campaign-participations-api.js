import { usecases } from '../../domain/usecases/index.js';
import { AssessmentCampaignResult } from './read-models/AssessmentCampaignResult.js';
import { CampaignParticipation } from './read-models/CampaignParticipation.js';

/**
 * @function
 * @name hasCampaignParticipations
 *
 * @param {number} userId
 * @returns {Promise<boolean>}
 */
export const hasCampaignParticipations = async ({ userId }) => {
  return usecases.hasCampaignParticipations({ userId });
};

export const getCampaignParticipationsByLearnerIdAndCampaignId = async ({ organizationLearnerId, campaignId }) => {
  return usecases.getCampaignParticipationsForOrganizationLearner({
    organizationLearnerId,
    campaignId,
  });
};

/**
 * @function
 * @name findByUserId
 *
 * @param {number} userId
 * @returns {Promise<Array<{id: number, campaignId: number, targetProfileId: number}>>}
 */
export const findByUserId = async ({ userId }) => {
  const participations = await usecases.findCampaignParticipationsByUserId({ userId });
  return participations.map((participation) => new CampaignParticipation(participation));
};

export const findByOrganizationLearnerIds = async ({ organizationLearnerIds }) => {
  const participations = await usecases.findCampaignParticipationsByOrganizationLearnerIds({ organizationLearnerIds });
  return participations.map((participation) => new CampaignParticipation(participation));
};

export const deleteCampaignParticipations = async ({
  userId,
  campaignParticipationIds,
  campaignId,
  keepPreviousDeletion,
  userRole,
  client,
}) => {
  for (const campaignParticipationId of campaignParticipationIds) {
    await usecases.deleteCampaignParticipation({
      userId,
      campaignId,
      campaignParticipationId,
      userRole,
      client,
      keepPreviousDeleted: keepPreviousDeletion,
    });
  }
};

/**
 * Retourne le taux de réussite et les niveaux atteints par compétence et par sujet pour une participation partagée.
 *
 * @function
 * @name getAssessmentCampaignResult
 *
 * @param {Object} params
 * @param {number} params.campaignParticipationId
 * @param {string} [params.locale='fr-FR']
 * @returns {Promise<AssessmentCampaignResult>}
 * @throws {UserNotAuthorizedToAccessEntityError} si la participation n'est pas partagée
 */
export const getAssessmentCampaignResult = async ({ campaignParticipationId, locale = 'fr-FR' }) => {
  const result = await usecases.getResultLevelsPerTubesAndCompetences({ campaignParticipationId, locale });
  return new AssessmentCampaignResult({
    id: result.id,
    masteryRate: result.masteryRate,
    maxReachableLevel: result.maxReachableLevel,
    meanReachedLevel: result.meanReachedLevel,
    levelsPerCompetence: result.levelsPerCompetence,
    levelsPerTube: result.levelsPerTube,
  });
};
