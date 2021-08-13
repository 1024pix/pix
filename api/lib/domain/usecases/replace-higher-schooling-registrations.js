module.exports = async function replaceHigherSchoolingRegistrations({
  organizationId,
  higherSchoolingRegistrationRepository,
  higherSchoolingRegistrationParser,
}) {
  const { registrations, warnings } = higherSchoolingRegistrationParser.parse();

  await higherSchoolingRegistrationRepository.replaceStudents(organizationId, registrations);

  return warnings;
};
