module.exports = async function importHigherSchoolingRegistration({
  higherSchoolingRegistrationRepository,
  higherSchoolingRegistrationParser,
}) {
  const { registrations, warnings } = higherSchoolingRegistrationParser.parse();

  await higherSchoolingRegistrationRepository.upsertStudents(registrations);

  return warnings;
};
