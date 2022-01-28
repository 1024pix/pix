const databaseBuffer = require('../database-buffer');

module.exports = function buildCertificationCenter({
  id = databaseBuffer.getNextId(),
  name = 'some name',
  type = 'SUP',
  externalId = 'EX123',
  createdAt = new Date('2020-01-01'),
  updatedAt,
  isSupervisorAccessEnabled = false,
} = {}) {
  const values = {
    id,
    name,
    type,
    externalId,
    createdAt,
    updatedAt,
    isSupervisorAccessEnabled,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'certification-centers',
    values,
  });
};
