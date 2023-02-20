export default async function replaceSupOrganizationLearners({
  organizationId,
  supOrganizationLearnerRepository,
  supOrganizationLearnerParser,
}) {
  const { learners, warnings } = supOrganizationLearnerParser.parse();

  await supOrganizationLearnerRepository.replaceStudents(organizationId, learners);

  return warnings;
}
