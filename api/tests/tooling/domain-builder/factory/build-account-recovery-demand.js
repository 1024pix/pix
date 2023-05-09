import { AccountRecoveryDemand } from '../../../../lib/domain/models/AccountRecoveryDemand.js';

const buildAccountRecoveryDemand = function ({
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

export { buildAccountRecoveryDemand };
