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
    userId: null,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    id: 2,
    firstName: 'Denise',
    lastName: 'Baudu',
    birthCity: 'Metz',
    birthProvinceCode: '57',
    birthCountry: 'France',
    birthdate: '2012-12-12',
    externalId: null,
    extraTimePercentage: 0.3,
    sessionId: 1,
    userId: null,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    id: 3,
    firstName: 'Beyoncé',
    lastName: 'Knowles',
    birthCity: 'Metz',
    birthProvinceCode: '57',
    birthCountry: 'France',
    birthdate: '1981-09-04',
    externalId: null,
    extraTimePercentage: 0.3,
    sessionId: 3,
    userId: null,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    id: 4,
    firstName: 'Beyoncé',
    lastName: 'Knowles',
    birthCity: 'Mulhouse',
    birthProvinceCode: '68',
    birthCountry: 'France',
    birthdate: '1981-09-04',
    externalId: null,
    extraTimePercentage: 0.3,
    sessionId: 3,
    userId: null,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    id: 5,
    firstName: 'Lady',
    lastName: 'Gaga',
    birthCity: 'Strasbourg',
    birthProvinceCode: '67',
    birthCountry: 'France',
    birthdate: '1986-03-28',
    externalId: null,
    extraTimePercentage: 0.3,
    sessionId: 3,
    userId: null,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    id: 6,
    firstName: 'Lady',
    lastName: 'Gaga',
    birthCity: 'Strasbourg',
    birthProvinceCode: '67',
    birthCountry: 'France',
    birthdate: '1986-03-28',
    externalId: null,
    extraTimePercentage: 0.3,
    sessionId: 4,
    userId: null,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    id: 7,
    firstName: 'Mariah',
    lastName: 'Carey',
    birthCity: 'Paris',
    birthProvinceCode: '75',
    birthCountry: 'France',
    birthdate: '1970-03-27',
    externalId: null,
    extraTimePercentage: 0.3,
    sessionId: 3,
    userId: 3,
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
