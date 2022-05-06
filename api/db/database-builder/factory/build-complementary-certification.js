const databaseBuffer = require('../database-buffer');

module.exports = function buildComplementaryCertification({
  id = databaseBuffer.getNextId(),
  name = 'UneSuperCertifComplémentaire',
  createdAt = new Date('2020-01-01'),
  minimumReproducibilityRate,
  minimumEarnedPix,
} = {}) {
  const values = {
    id,
    name,
    createdAt,
    minimumReproducibilityRate,
    minimumEarnedPix,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certifications',
    values,
  });
};
