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
    status: 'finalized',
  });

  databaseBuilder.factory.buildSession({
    id: 3,
    certificationCenter: 'Tour Gamma',
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
    certificationCenter: 'Tour Gamma',
    address: 'Rue Bikub',
    examiner: 'Sophie',
    date: '2018-06-10',
    time: '15:00',
    description: 'Session',
    room: 'Salle Opette',
    accessCode: 'JKL78',
    status: 'finalized',
    certificationCenterId: 1,
    examinerGlobalComment: 'Le Lorem Ipsum est simplement du faux texte employé dans la composition et la mise en page avant impression. Le Lorem Ipsum est le faux texte standard de l\'imprimerie depuis les années 1500, quand un imprimeur anonyme assembla ensemble des morceaux de texte pour réaliser un livre spécimen de polices de texte. Il n\'a pas fait que survivre cinq siècles, mais s\'est aussi adapté à la bureautique informatique, sans que son contenu n\'en soit modifié.',
    finalizedAt: new Date('2018-06-15T15:00:34Z'),
  });

  databaseBuilder.factory.buildSession({
    id: 5,
    certificationCenter: 'Tour Gamma',
    address: 'Rue Bikub',
    examiner: 'Mathias',
    date: '2019-06-10',
    time: '15:00',
    description: 'Session',
    room: 'Salle Tainbanque',
    accessCode: 'JKL78',
    status: 'started',
    certificationCenterId: 1,
    examinerGlobalComment: '',
  });
};
