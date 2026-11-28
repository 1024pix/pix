import { CreditsLot } from '../../../../../src/organizational-entities/domain/credits/read-models/CreditsLot.js';
const buildCreditsLot = function ({
  id = 1234,
  structureId = 5678,
  count = 55,
  activationDate = new Date('2026-01-01'),
  expirationDate = new Date('2026-12-31'),
  reference = 'TEST',
  creatorFirstName = 'Thomas',
  creatorLastName = 'The Tank Engine',
} = {}) {
  return new CreditsLot({
    id,
    structureId,
    count,
    activationDate,
    expirationDate,
    reference,
    creatorFirstName,
    creatorLastName,
  });
};

export { buildCreditsLot };
