const databaseBuffer = require('../database-buffer');

module.exports = function buildAccreditation({
  id = databaseBuffer.getNextId(),
  name = 'UneSuperCertifComplémentaire',
  createdAt = new Date('2020-01-01'),
} = {}) {
  const values = {
    id,
    name,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'accreditations',
    values,
  });
};
