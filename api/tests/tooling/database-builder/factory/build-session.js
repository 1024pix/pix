const faker = require('faker');
const databaseBuffer = require('../database-buffer');

module.exports = function buildSession({
  id = faker.random.number(),
  certificationCenter = faker.company.companyName(),
  address = faker.address.streetAddress(),
  room = '28D',
  examiner = faker.name.findName(),
  date = faker.date.recent(),
  time = '14:30',
  description = faker.random.words(),
} = {}) {

  const values = {
    id,
    certificationCenter,
    address,
    room,
    examiner,
    date,
    time,
    description,
  };

  databaseBuffer.pushInsertable({
    tableName: 'sessions',
    values,
  });

  return values;
};

