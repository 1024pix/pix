export async function findIdWithLastActivityDatePriorTo({
  organizationId,
  lastActivityDate,
  libOrganizationLearnerRepository,
}) {
  return await libOrganizationLearnerRepository.findIdWithLastActivityDatePriorTo({
    organizationId,
    lastActivityDate,
  });
}
