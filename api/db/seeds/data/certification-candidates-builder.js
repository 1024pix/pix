const moment = require('moment');
const faker = require('faker');
const CANDIDATE_COUNT = 300;

module.exports = function sessionsBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCandidate({
    id: 1,
    firstName: 'Étienne',
    lastName: 'Lantier',
    birthCity: 'Ajaccio',
    birthProvinceCode: '2A',
    birthCountry: 'Corse',
    birthdate: '1990-01-04',
    externalId: 'ELAN123',
    extraTimePercentage: null,
    sessionId: 1,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    id: 2,
    firstName: 'Denise',
    lastName: 'Baudu',
    birthCity: 'Metz',
    birthProvinceCode: '57',
    birthCountry: 'France',
    birthdate: '2008-12-25',
    externalId: null,
    extraTimePercentage: 0.3,
    sessionId: 1,
  });

  const originLocale = faker.locale;
  faker.locale = 'fr';
  for (let i = 0; i < CANDIDATE_COUNT; ++i) {
    const extraTimePercentage = i % 2 === 0 ? null : (faker.random.number(99) / 100);
    databaseBuilder.factory.buildCertificationCandidate({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      birthCity: faker.address.city(),
      birthProvinceCode: faker.random.alphaNumeric(3),
      birthCountry: faker.address.country(),
      birthdate: moment(faker.date.past(90)).format('YYYY-MM-DD'),
      externalId: faker.random.alphaNumeric(6),
      extraTimePercentage,
      sessionId: 4,
    });
  }

  faker.locale = originLocale;
};
