const deleteOrganizationLearners = async function ({
  organizationLearnerIds,
  userId,
  organizationLearnerRepository,
  campaignParticipationRepository,
}) {
  await campaignParticipationRepository.removeByOrganizationLearnerIds({
    organizationLearnerIds,
    userId,
  });

  await organizationLearnerRepository.removeByIds({ organizationLearnerIds, userId });
};

export { deleteOrganizationLearners };
