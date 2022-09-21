const databaseBuffer = require('../database-buffer');

module.exports = function buildComplementaryCertification({
  id = databaseBuffer.getNextId(),
  label = 'UneSuperCertifComplémentaire',
  key = 'SUPERCERTIF',
  createdAt = new Date('2020-01-01'),
  minimumReproducibilityRate = 70.0,
  minimumEarnedPix,
  hasComplementaryReferential = false,
  hasExternalJury = false,
} = {}) {
  const values = {
    id,
    label,
    key,
    createdAt,
    minimumReproducibilityRate,
    minimumEarnedPix,
    hasComplementaryReferential,
    hasExternalJury,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certifications',
    values,
  });
};
