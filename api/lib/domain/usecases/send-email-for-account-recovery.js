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
  const { email: newEmail, ineIna, ...otherStudentInformation } = studentInformation;
  const { id, userId, firstName } = await schoolingRegistrationRepository.getSchoolingRegistrationInformation({
    ...otherStudentInformation,
    nationalStudentId: ineIna,
  });
  const { email: oldEmail } = await userRepository.get(userId);
  await userRepository.isEmailAvailable(newEmail);

  const accountRecoveryDemand = new AccountRecoveryDemand({
    userId,
    schoolingRegistrationId: id,
    newEmail,
    oldEmail,
    used: false,
    temporaryKey,
  });
  await accountRecoveryDemandRepository.save(accountRecoveryDemand);

  await mailService.sendAccountRecoveryEmail({
    firstName,
    email: newEmail,
    temporaryKey,
  });
};
