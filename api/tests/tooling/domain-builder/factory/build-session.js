const faker = require('faker');
const moment = require('moment');
const Session = require('../../../../lib/domain/models/Session');

module.exports = function buildSession({
  id = faker.random.number(),
  certificationCenter = faker.company.companyName(),
  certificationCenterId,
  accessCode = faker.random.alphaNumeric(9),
  address = faker.address.streetAddress(),
  room = '28D',
  examiner = faker.name.findName(),
  date = moment(faker.date.recent()).format('YYYY-MM-DD'),
  time = '14:30',
  description = faker.random.words(),
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
  });
};
