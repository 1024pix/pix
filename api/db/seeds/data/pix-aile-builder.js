module.exports = function addPixAileUserAndRelations({ databaseBuilder }) {

  const pixAile = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 1,
    firstName: 'Pix',
    lastName: 'Aile',
    email: 'userpix1@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildAssessment({
    id: 1,
    courseId: 'recyochcrrSOALQPS',
    createdAt: new Date('2018-02-15T15:00:34'),
    updatedAt: new Date('2018-02-15T15:00:34'),
    userId: pixAile.id,
    type: 'PLACEMENT',
    state: 'completed',
  });
};
