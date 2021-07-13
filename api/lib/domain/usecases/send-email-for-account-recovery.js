const crypto = require('crypto');
const AccountRecoveryDemand = require('../models/AccountRecoveryDemand');

module.exports = async function sendEmailForAccountRecovery({
  userId,
  email,
  temporaryKey = crypto.randomBytes(32).toString('base64'),
  userRepository,
  accountRecoveryDemandRepository,
  mailService,
}) {
  await userRepository.isEmailAvailable(email);
  const user = await userRepository.get(userId);

  const accountRecoveryDemand = new AccountRecoveryDemand({
    userId,
    newEmail: email.toLowerCase(),
    oldEmail: user.email,
    used: false,
    temporaryKey,
  });
  await accountRecoveryDemandRepository.save(accountRecoveryDemand);

  await mailService.sendAccountRecoveryEmail({
    firstName: user.firstName,
    email,
    temporaryKey,
  });
};
