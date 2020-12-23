module.exports = function addPixAileUserAndRelations({ databaseBuilder }) {

  databaseBuilder.factory.buildUser.withRawPassword({
    id: 1,
    firstName: 'Pix',
    lastName: 'Aile',
    email: 'userpix1@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });
};
