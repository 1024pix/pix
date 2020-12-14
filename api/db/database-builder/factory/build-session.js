const faker = require('faker');
const buildCertificationCenter = require('./build-certification-center');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');
const moment = require('moment');

module.exports = function buildSession({
  id,
  accessCode = faker.random.alphaNumeric(9),
  address = faker.address.streetAddress(),
  certificationCenter = faker.company.companyName(),
  certificationCenterId,
  date = moment(faker.date.recent()).format('YYYY-MM-DD'),
  description = faker.random.words(),
  examiner = faker.name.findName(),
  room = faker.random.alphaNumeric(9),
  time = faker.random.number({ min: 0, max: 23 }).toString().padStart(2, '0') + ':' + faker.random.number({ min: 0, max: 59 }).toString().padStart(2, '0') + ':' + faker.random.number({ min: 0, max: 59 }).toString().padStart(2, '0'),
  examinerGlobalComment = '',
  createdAt = faker.date.recent(),
  finalizedAt = null,
  resultsSentToPrescriberAt = null,
  publishedAt = null,
  assignedCertificationOfficerId,
} = {}) {

  if (_.isUndefined(certificationCenterId)) {
    const builtCertificationCenter = buildCertificationCenter();
    certificationCenter = builtCertificationCenter.name;
    certificationCenterId = builtCertificationCenter.id;
  }
  const values = {
    id,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment,
    createdAt,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficerId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'sessions',
    values,
  });
};
