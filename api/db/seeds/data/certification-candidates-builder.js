module.exports = function sessionsBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCandidate({
    id: 1,
    firstName: 'Étienne',
    lastName: 'Lantier',
    birthplace: 'Ajaccio',
    birthdate: '1990-01-04',
    externalId: 'ELAN123',
    extraTimePercentage: null,
    sessionId: 1,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    id: 2,
    firstName: 'Denise',
    lastName: 'Baudu',
    birthplace: 'Metz',
    birthdate: '2008-12-25',
    externalId: null,
    extraTimePercentage: 0.3,
    sessionId: 1,
  });
  databaseBuilder.factory.buildCertificationCandidate({
    id: 3,
    firstName: 'Octave',
    lastName: 'Mouret',
    birthplace: 'Céret',
    birthdate: '1925-08-05',
    externalId: 'OMOU789',
    extraTimePercentage: null,
    sessionId: 4,
  });

  databaseBuilder.factory.buildCertificationCandidate({
    id: 4,
    firstName: 'Jeanlin',
    lastName: 'Maheu',
    birthplace: 'Paris',
    birthdate: '1958-04-01',
    externalId: 'JMAH456',
    extraTimePercentage: 1,
    sessionId: 4,
  });
};
