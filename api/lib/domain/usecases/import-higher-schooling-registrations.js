module.exports = async function importHigherSchoolingRegistration({ higherSchoolingRegistrationRepository, higherSchoolingRegistrationParser }) {
  const higherSchoolingRegistrationSet = higherSchoolingRegistrationParser.parse();
  await higherSchoolingRegistrationRepository.saveSet(higherSchoolingRegistrationSet);
};
