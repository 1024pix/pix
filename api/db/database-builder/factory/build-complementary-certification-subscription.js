const _ = require('lodash');
const buildCertificationCandidate = require('./build-certification-candidate');
const buildComplementaryCertification = require('./build-complementary-certification');
const databaseBuffer = require('../database-buffer');

module.exports = function buildComplementaryCertificationSubscription({
  certificationCandidateId,
  complementaryCertificationId,
  createdAt = new Date('2020-01-01'),
} = {}) {
  certificationCandidateId = _.isNull(certificationCandidateId)
    ? buildCertificationCandidate().id
    : certificationCandidateId;
  complementaryCertificationId = _.isNull(complementaryCertificationId)
    ? buildComplementaryCertification().id
    : complementaryCertificationId;

  const values = {
    certificationCandidateId,
    complementaryCertificationId,
    createdAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certification-subscriptions',
    values,
  });
};
