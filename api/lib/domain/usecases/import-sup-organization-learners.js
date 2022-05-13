module.exports = async function importSupOrganizationLearners({
  supOrganizationLearnerRepository,
  supOrganizationLearnerParser,
}) {
  const { learners, warnings } = supOrganizationLearnerParser.parse();

  await supOrganizationLearnerRepository.addStudents(learners);

  return warnings;
};
