import { usecases } from '../../domain/usecases/index.js';
import { CampaignParticipation } from './read-models/CampaignParticipation.js';
import { CampaignParticipationResult } from './read-models/CampaignParticipationResult.js';

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
 * Returns the mastery rate and reached levels by tube and competence for a shared participation.
 *
 * @function
 * @name getCampaignParticipationResult
 *
 * @param {Object} params
 * @param {number} params.campaignParticipationId
 * @param {string} [params.locale='fr-FR']
 * @returns {Promise<CampaignParticipationResult>}
 * @throws {UserNotAuthorizedToAccessEntityError} when the participation is not shared
 */
export const getCampaignParticipationResult = async ({ campaignParticipationId, locale = 'fr-FR' }) => {
  const result = await usecases.getResultLevelsPerTubesAndCompetences({ campaignParticipationId, locale });
  return new CampaignParticipationResult(result);
};
