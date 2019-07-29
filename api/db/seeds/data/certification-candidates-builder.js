module.exports = function sessionsBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCandidate({
    id: 1,
    firstName: 'Étienne',
    lastName: 'Lantier',
    birthCountry: 'France',
    birthProvince: '2A',
    birthCity: 'Ajaccio',
    externalId: 'ELAN123',
    extraTimePercentage: null,
    sessionId: 1,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    id: 2,
    firstName: 'Denise',
    lastName: 'Baudu',
    birthCountry: 'France',
    birthProvince: '57',
    birthCity: 'Metz',
    externalId: 'DBAU123',
    extraTimePercentage: 30,
    sessionId: 1,
  });
  databaseBuilder.factory.buildCertificationCandidate({
    id: 3,
    firstName: 'Octave',
    lastName: 'Mouret',
    birthCountry: 'France',
    birthProvince: '66',
    birthCity: 'Céret',
    externalId: 'OMOU789',
    extraTimePercentage: null,
    sessionId: 4,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    id: 4,
    firstName: 'Jeanlin',
    lastName: 'Maheu',
    birthCountry: 'France',
    birthProvince: '75',
    birthCity: 'Paris',
    externalId: 'JMAH456',
    extraTimePercentage: 100,
    sessionId: 4,
  });
};
