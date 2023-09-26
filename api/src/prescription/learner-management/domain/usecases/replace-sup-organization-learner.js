const replaceSupOrganizationLearners = async function ({
  organizationId,
  userId,
  supOrganizationLearnerRepository,
  supOrganizationLearnerParser,
}) {
  const { learners, warnings } = supOrganizationLearnerParser.parse();

  await supOrganizationLearnerRepository.replaceStudents(organizationId, learners, userId);

  return warnings;
};

export { replaceSupOrganizationLearners };
