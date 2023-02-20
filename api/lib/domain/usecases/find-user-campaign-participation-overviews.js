export default async function findUserCampaignParticipationOverviews({
  userId,
  states,
  page,
  campaignParticipationOverviewRepository,
}) {
  const concatenatedStates = states ? [].concat(states) : undefined;

  const campaignParticipationOverviews = await campaignParticipationOverviewRepository.findByUserIdWithFilters({
    userId,
    states: concatenatedStates,
    page,
  });

  return campaignParticipationOverviews;
}
