import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';export const findPaginatedFilteredAttestationParticipantsStatus = async (
  {
    attestationKey,
    organizationId,
    filter,
    page,
    organizationLearnerRepository = injectedRepositories.organizationLearnerRepository,
  } = {},
) => {
  const { search: name, divisions, statuses } = filter;
  const { learners, pagination } = await organizationLearnerRepository.findPaginatedLearners({
    organizationId,
    filter: { name, divisions },
    page,
  });

  let attestationParticipantsStatus =
    await organizationLearnerRepository.getAttestationStatusForOrganizationLearnersAndKey({
      attestationKey,
      organizationLearners: learners,
      organizationId,
    });

  if (statuses?.length > 0) {
    attestationParticipantsStatus = attestationParticipantsStatus.filter((attestationParticipantStatus) =>
      _filterByStatuses(attestationParticipantStatus, statuses),
    );
  }

  return {
    attestationParticipantsStatus,
    pagination,
  };
};

function _filterByStatuses(attestationParticipantStatus, filterStatuses) {
  const isFilteredByObtained = filterStatuses.includes('OBTAINED') && Boolean(attestationParticipantStatus.obtainedAt);
  const isFilteredByNotObtained = filterStatuses.includes('NOT_OBTAINED') && !attestationParticipantStatus.obtainedAt;
  return isFilteredByObtained || isFilteredByNotObtained;
}
