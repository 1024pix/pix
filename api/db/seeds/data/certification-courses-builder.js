module.exports = function certificationCoursesBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildCertificationCourse({
    id: 1,
    userId: 1,
    completedAt: new Date('2018-02-15T15:15:52Z'),
    updatedAt: new Date('2018-02-15T15:14:48Z'),
    createdAt: new Date('2018-02-15T15:14:46Z'),
    firstName: 'Pix',
    lastName: 'Aile',
    birthdate: '1960-12-12',
    birthplace: 'Paris',
    sessionId: 1,
    externalId: 'NumeroEtudiantHubert',
    isPublished: true
  });

  databaseBuilder.factory.buildCertificationCourse({
    id: 2,
    userId: 1,
    completedAt: new Date('2018-04-27T10:11:02Z'),
    createdAt: new Date('2018-04-27T10:10:52Z'),
    firstName: 'Pix',
    lastName: 'Aile',
    birthdate: '1994-04-01',
    birthplace: 'Bruxelles',
    sessionId: 2,
    externalId: 'L\'élève',
    isPublished: true,
    isV2Certification: true
  });

  databaseBuilder.factory.buildCertificationCourse({
    id: 3,
    userId: 1,
    completedAt: new Date('2018-01-15T15:15:52Z'),
    createdAt: new Date('2018-01-15T15:14:46Z'),
    firstName: 'Pix',
    lastName: 'Aile',
    birthdate: '1994-04-01',
    birthplace: 'Bruxelles',
    sessionId: 1,
    externalId: 'L\'élève',
    isPublished: false
  });
};
