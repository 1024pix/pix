const replaceSupOrganizationLearners = async function ({
  organizationId,
  supOrganizationLearnerRepository,
  supOrganizationLearnerParser,
}) {
  const { learners, warnings } = supOrganizationLearnerParser.parse();

  await supOrganizationLearnerRepository.replaceStudents(organizationId, learners);

  return warnings;
};

export { replaceSupOrganizationLearners };
