const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildSession({
  id,
  certificationCenter = faker.company.companyName(),
  certificationCenterId,
  accessCode = faker.random.alphaNumeric(9),
  address = faker.address.streetAddress(),
  room = '28D',
  examiner = faker.name.findName(),
  date = faker.date.recent(),
  time = '14:30',
  description = faker.random.words(),
  createdAt = faker.date.recent(),
} = {}) {

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
  };
  return databaseBuffer.pushInsertable({
    tableName: 'sessions',
    values,
  });
};
