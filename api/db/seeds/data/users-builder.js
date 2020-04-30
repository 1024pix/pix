module.exports = function usersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 3,
    firstName: 'Tyrion',
    lastName: 'Lannister',
    email: 'sup@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 4,
    firstName: 'John',
    lastName: 'Snow',
    email: 'sco@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 5,
    firstName: 'Pix',
    lastName: 'Master',
    email: 'pixmaster@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 9,
    firstName: 'Aemon',
    lastName: 'Targaryen',
    email: 'sco2@example.net',
    rawPassword: 'pix123',
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 10,
    firstName: 'Lance',
    lastName: 'Low',
    username: 'lance.low1234',
    rawPassword: 'pix123',
    cgu: true,
  });

  const userShouldChangePassword = {
    firstName: 'Joffrey',
    lastName: 'Baratheon',
    email: null,
    username: 'username123',
    rawPassword: 'Password123',
    cgu: false,
    shouldChangePassword: true,
  };
  databaseBuilder.factory.buildUser.withUnencryptedPassword(userShouldChangePassword);

  const userWithSamlId = {
    firstName: 'Margaery',
    lastName: 'Tyrell',
    email: null,
    rawPassword: 'Password123',
    cgu: false,
    samlId: 'samlId'
  };
  databaseBuilder.factory.buildUser.withUnencryptedPassword(userWithSamlId);

};
