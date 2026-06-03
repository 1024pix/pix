/**
 * @typedef {import('../../../infrastructure/repositories/campaign-participations-stats-repository.js')} CampaignParticipationsStatsRepository
 * @param {Object} params
 * @param {Number} params.organizationId
 * @param {CampaignParticipationsStatsRepository} params.campaignParticipationsStatsRepository
 * @returns {Promise<{totalParticipantsCount: Number, totalParticipantsCountByYear: Array<{year: Number, count: Number}> | []}>}
 */

const getOrganizationParticipantsStatistics = async function ({
  organizationId,
  campaignParticipationsStatsRepository,
}) {
  const totalParticipantsCount =
    await campaignParticipationsStatsRepository.countParticipantsByOrganizationId(organizationId);

  const totalParticipantsCountByYear =
    await campaignParticipationsStatsRepository.countParticipantsByOrganizationIdGroupedByYear(organizationId);

  return { totalParticipantsCount, totalParticipantsCountByYear };
};

export { getOrganizationParticipantsStatistics };
