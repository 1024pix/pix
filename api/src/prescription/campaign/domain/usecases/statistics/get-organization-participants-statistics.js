const getOrganizationParticipantsStatistics = async function ({
  organizationId,
  campaignParticipationsStatsRepository,
}) {
  const totalParticipantsCount =
    await campaignParticipationsStatsRepository.countParticipantsByOrganizationId(organizationId);
  return { totalParticipantsCount };
};

export { getOrganizationParticipantsStatistics };
