module.exports = function sessionsBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildSession({
    id: 1,
    certificationCenter: 'Tour Gamma',
    address: 'Rue de bercy',
    examiner: 'Benoit',
    date: '2028-01-15',
    time: '14:00:00',
    description: 'Sesssion 1',
    room: 'Salle 2',
    accessCode: 'ABC12',
    certificationCenterId: 1,
  });

  databaseBuilder.factory.buildSession({
    id: 2,
    certificationCenter: 'Tour Theta',
    address: 'Rue de la soif',
    examiner: 'Sophie',
    date: '2028-04-27',
    time: '10:00',
    description: 'Session de rattrapage',
    room: 'Salle Eau',
    accessCode: 'DEF34',
  });

  databaseBuilder.factory.buildSession({
    id: 3,
    certificationCenter: 'Tour Alpha',
    address: 'Rue Bikub',
    examiner: 'Sophie',
    date: '2028-05-27',
    time: '15:00',
    description: 'Session',
    room: 'Salle Feu',
    accessCode: 'GHI56',
    certificationCenterId: 1,
  });

  databaseBuilder.factory.buildSession({
    id: 4,
    certificationCenter: 'Tour Alpha',
    address: 'Rue Bikub',
    examiner: 'Sophie',
    date: '2018-06-10',
    time: '15:00',
    description: 'Session',
    room: 'Salle Opette',
    accessCode: 'JKL78',
    certificationCenterId: 1,
  });
};
