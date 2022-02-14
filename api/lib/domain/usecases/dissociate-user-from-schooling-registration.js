const { SchoolingRegistrationCannotBeDissociatedError } = require('../errors');

module.exports = async function dissociateUserFromSchoolingRegistration({
  schoolingRegistrationId,
  schoolingRegistrationRepository,
}) {
  const schoolingRegistrationForAdmin = await schoolingRegistrationRepository.getSchoolingRegistrationForAdmin(
    schoolingRegistrationId
  );
  if (!schoolingRegistrationForAdmin.canBeDissociated) {
    throw new SchoolingRegistrationCannotBeDissociatedError();
  }

  await schoolingRegistrationRepository.dissociateUserFromSchoolingRegistration(schoolingRegistrationId);
};
