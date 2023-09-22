const importSupOrganizationLearners = async function ({
  supOrganizationLearnerRepository,
  supOrganizationLearnerParser,
}) {
  const { learners, warnings } = supOrganizationLearnerParser.parse();

  await supOrganizationLearnerRepository.addStudents(learners);

  return warnings;
};

export { importSupOrganizationLearners };
