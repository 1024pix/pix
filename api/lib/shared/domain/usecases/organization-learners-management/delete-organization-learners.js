const deleteOrganizationLearners = async function ({
  organizationLearnerIds,
  userId,
  organizationLearnerRepository,
  campaignParticipationRepository,
  domainTransaction,
}) {
  await campaignParticipationRepository.removeByOrganizationLearnerIds({
    organizationLearnerIds,
    userId,
    domainTransaction,
  });

  await organizationLearnerRepository.removeByIds({ organizationLearnerIds, userId, domainTransaction });
};

export { deleteOrganizationLearners };
