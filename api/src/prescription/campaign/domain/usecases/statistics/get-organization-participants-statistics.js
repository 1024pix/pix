/**
 * @typedef {import('../../../infrastructure/repositories/campaign-participations-stats-repository.js')} CampaignParticipationsStatsRepository
 * @param {Object} params
 * @param {Number} params.organizationId
 * @param {CampaignParticipationsStatsRepository} params.campaignParticipationsStatsRepository
 * @returns {Promise<{totalParticipantsCount: Number}>}
 */

const getOrganizationParticipantsStatistics = async function ({
  organizationId,
  campaignParticipationsStatsRepository,
}) {
  const totalParticipantsCount =
    await campaignParticipationsStatsRepository.countParticipantsByOrganizationId(organizationId);
  return { totalParticipantsCount };
};

export { getOrganizationParticipantsStatistics };
