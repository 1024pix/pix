module.exports = async function importHigherEducationRegistration({ higherEducationRegistrationRepository, higherEducationRegistrationParser }) {
  const higherEducationRegistrationSet = higherEducationRegistrationParser.parse();
  await higherEducationRegistrationRepository.saveSet(higherEducationRegistrationSet);
};
