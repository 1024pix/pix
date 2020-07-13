module.exports = async function importHigherEducationRegistration({ organizationId, higherEducationRegistrationRepository, higherEducationRegistrationParser }) {
  const higherEducationRegistrationSet = higherEducationRegistrationParser.parse();
  await higherEducationRegistrationRepository.saveSet(higherEducationRegistrationSet, organizationId);
};
