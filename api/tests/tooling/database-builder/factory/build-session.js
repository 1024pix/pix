const faker = require('faker');
const buildCertificationCenter = require('./build-certification-center');
const databaseBuffer = require('../database-buffer');
const Session = require('../../../../lib/domain/models/Session');
const _ = require('lodash');
const moment = require ('moment');

module.exports = function buildSession({
  id,
  certificationCenter = faker.company.companyName(),
  certificationCenterId,
  accessCode = faker.random.alphaNumeric(9),
  address = faker.address.streetAddress(),
  room = faker.random.alphaNumeric(9),
  examiner = faker.name.findName(),
  date = moment(faker.date.recent()).format('YYYY-MM-DD'),
  time = faker.random.number({ min: 0, max: 23 }).toString().padStart(2, '0') + ':' + faker.random.number({ min: 0, max: 59 }).toString().padStart(2, '0') + ':' + faker.random.number({ min: 0, max: 59 }).toString().padStart(2, '0'),
  description = faker.random.words(),
  createdAt = faker.date.recent(),
  status = Session.statuses.STARTED,
  examinerComment = '',
} = {}) {

  if (_.isUndefined(certificationCenterId)) {
    const builtCertificationCenter = buildCertificationCenter();
    certificationCenter = builtCertificationCenter.name;
    certificationCenterId = builtCertificationCenter.id;
  }
  const values = {
    id,
    certificationCenter,
    certificationCenterId,
    accessCode,
    address,
    room,
    examiner,
    date,
    time,
    description,
    createdAt,
    status,
    examinerComment,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'sessions',
    values,
  });
};
