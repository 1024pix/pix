const _ = require('lodash');
const buildCertificationCenter = require('./build-certification-center');
const buildAccreditation = require('./build-accreditation');
const databaseBuffer = require('../database-buffer');

module.exports = function buildGrantedAccreditation({
  id = databaseBuffer.getNextId(),
  certificationCenterId,
  accreditationId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  certificationCenterId = _.isNull(certificationCenterId) ? buildCertificationCenter().id : certificationCenterId;
  accreditationId = _.isNull(accreditationId) ? buildAccreditation().id : accreditationId;

  const values = {
    id,
    certificationCenterId,
    accreditationId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'granted-accreditations',
    values,
  });
};
