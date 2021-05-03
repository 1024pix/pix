module.exports = async function importHigherSchoolingRegistration({
  higherSchoolingRegistrationRepository,
  higherSchoolingRegistrationParser,
}) {
  const { registrations } = higherSchoolingRegistrationParser.parse();

  await higherSchoolingRegistrationRepository.upsertStudents(registrations);
};
