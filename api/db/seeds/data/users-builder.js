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

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 200,
    firstName: 'Pix',
    lastName: 'Masteur',
    rawPassword: 'pix123',
    email: 'pixmasteur@example.net',
    cgu: true,
  });
};
