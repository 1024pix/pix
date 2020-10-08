const faker = require('faker');
const moment = require('moment');
const Session = require('../../../../lib/domain/models/Session');

module.exports = function buildSession({
  id = faker.random.number(),
  accessCode = faker.random.alphaNumeric(9),
  address = faker.address.streetAddress(),
  certificationCenter = faker.company.companyName(),
  certificationCenterId,
  date = moment(faker.date.recent()).format('YYYY-MM-DD'),
  description = faker.random.words(),
  examiner = faker.name.findName(),
  room = '28D',
  time = '14:30',
  examinerGlobalComment = '',
  finalizedAt = null,
  resultsSentToPrescriberAt = null,
  publishedAt = null,
  assignedCertificationOfficerId,
  certificationCandidates = [],
} = {}) {
  return new Session({
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
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficerId,
    certificationCandidates,
  });
};
