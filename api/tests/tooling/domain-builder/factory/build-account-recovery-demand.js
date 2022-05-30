const AccountRecoveryDemand = require('../../../../lib/domain/models/AccountRecoveryDemand');

module.exports = function buildAccountRecoveryDemand({
  userId = 7,
  organizationLearnerId,
  newEmail = 'new-email@example.net',
  oldEmail = 'old-email@example.net',
  used = false,
  temporaryKey = '1234567890AZERTY',
} = {}) {
  return new AccountRecoveryDemand({
    userId,
    organizationLearnerId,
    newEmail,
    oldEmail,
    used,
    temporaryKey,
  });
};
