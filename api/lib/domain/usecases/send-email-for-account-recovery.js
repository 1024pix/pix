const crypto = require('crypto');
const AccountRecoveryDemand = require('../models/AccountRecoveryDemand');

module.exports = async function sendEmailForAccountRecovery({
  studentInformation,
  temporaryKey = crypto.randomBytes(32).toString('base64'),
  schoolingRegistrationRepository,
  userRepository,
  accountRecoveryDemandRepository,
  mailService,
}) {
  const { email: newEmail, ...otherStudentInformation } = studentInformation;
  const { id, userId } = await schoolingRegistrationRepository.getSchoolingRegistrationInformation(otherStudentInformation);
  const { email } = await userRepository.get(userId);
  await userRepository.isEmailAvailable(newEmail);

  const accountRecoveryDemand = new AccountRecoveryDemand({
    userId,
    schoolingRegistrationId: id,
    newEmail: newEmail.toLowerCase(),
    oldEmail: email,
    used: false,
    temporaryKey,
  });
  await accountRecoveryDemandRepository.save(accountRecoveryDemand);

  await mailService.sendAccountRecoveryEmail({
    firstName: otherStudentInformation.firstName,
    email: newEmail,
    temporaryKey,
  });
};
