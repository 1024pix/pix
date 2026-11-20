import { databaseBuffer } from '../database-buffer.ts';
import { buildStructure } from './build-structure.js';
import { buildUser } from './build-user.js';

const buildCreditsLot = function buildCreditsLot({
  id = databaseBuffer.getNextId(),
  structureId,
  count = 10,
  activationDate = new Date('2020-01-01'),
  expirationDate = new Date('2999-12-31'),
  reference = 'CONV-0001',
  createdBy,
  createdAt = new Date('2020-01-01'),
} = {}) {
  structureId = structureId || buildStructure().id;
  createdBy = createdBy || buildUser.withRole({ firstName: 'Anne', lastName: 'Garbure' }).id;

  const values = {
    id,
    structure_id: structureId,
    count,
    activation_date: activationDate,
    expiration_date: expirationDate,
    reference,
    created_by: createdBy,
    created_at: createdAt,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'credits_lots',
    values,
  });
};

export { buildCreditsLot };
