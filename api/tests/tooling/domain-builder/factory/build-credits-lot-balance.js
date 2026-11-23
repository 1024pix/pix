import { CreditsLotBalance } from '../../../../src/organizational-entities/domain/credits/models/CreditsLotBalance.js';

function buildCreditsLotBalance({
  id = 1,
  count = 10,
  consumedCount = 0,
  activationDate = '2020-01-01',
  expirationDate = '2999-12-31',
} = {}) {
  return new CreditsLotBalance({ id, count, consumedCount, activationDate, expirationDate });
}

export { buildCreditsLotBalance };
