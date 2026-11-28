import { OrganizationCreditsLot } from '../../../../../src/organizational-entities/domain/credits/read-models/OrganizationCreditsLot.js';

const buildOrganizationCreditsLot = function ({
  id = 1234,
  count = 10,
  activationDate = new Date('2026-01-01'),
  expirationDate = new Date('2999-12-31'),
  reference = 'TEST',
  consumptions = [],
} = {}) {
  return new OrganizationCreditsLot({
    id,
    count,
    activationDate,
    expirationDate,
    reference,
    consumptions,
  });
};

export { buildOrganizationCreditsLot };
