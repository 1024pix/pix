module.exports = async function importHigherSchoolingRegistration({
  higherSchoolingRegistrationRepository,
  higherSchoolingRegistrationParser,
}) {
  const { registrations, warnings } = higherSchoolingRegistrationParser.parse();

  await higherSchoolingRegistrationRepository.addStudents(registrations);

  return warnings;
};
