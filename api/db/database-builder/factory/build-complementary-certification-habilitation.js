const _ = require('lodash');
const buildCertificationCenter = require('./build-certification-center');
const buildComplementaryCertification = require('./build-complementary-certification');
const databaseBuffer = require('../database-buffer');

module.exports = function buildComplementaryCertificationHabilitation({
  id = databaseBuffer.getNextId(),
  certificationCenterId,
  complementaryCertificationId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  certificationCenterId = _.isNull(certificationCenterId) ? buildCertificationCenter().id : certificationCenterId;
  complementaryCertificationId = _.isNull(complementaryCertificationId)
    ? buildComplementaryCertification().id
    : complementaryCertificationId;

  const values = {
    id,
    certificationCenterId,
    complementaryCertificationId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certification-habilitations',
    values,
  });
};
