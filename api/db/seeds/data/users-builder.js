const PIX_MASTER_ID = 199;

const defaultPassword = 'pix123';
const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');

function usersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: PIX_MASTER_ID,
    firstName: 'Pix',
    lastName: 'Master',
    email: 'pixmaster@example.net',
    rawPassword: defaultPassword,
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 10,
    firstName: 'Lance',
    lastName: 'Low',
    username: 'lance.low1234',
    rawPassword: defaultPassword,
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

  const userWithSamlId = databaseBuilder.factory.buildUser.withUnencryptedPassword({
    firstName: 'Margaery',
    lastName: 'Tyrell',
    email: null,
    rawPassword: 'Password123',
    cgu: false,
  });

  databaseBuilder.factory.buildAuthenticationMethod({
    identityProvider: AuthenticationMethod.identityProviders.GAR,
    externalIdentifier: 'samlId',
    userId: userWithSamlId.id,
  });

  const userWithLastTermsOfServiceValidated = {
    firstName: 'lasttermsofservice',
    lastName: 'validated',
    email: 'lasttermsofservice@validated.net',
    rawPassword: 'Password123',
    cgu: true,
    mustValidateTermsOfService: false,
    lastTermsOfServiceValidatedAt: '2020-07-22',
  };
  databaseBuilder.factory.buildUser.withUnencryptedPassword(userWithLastTermsOfServiceValidated);

  const userWithLastTermsOfServiceNotValidated = {
    firstName: 'lasttermsofservice',
    lastName: 'notValidated',
    email: 'lasttermsofservice@notvalidated.net',
    rawPassword: 'Password123',
    cgu: true,
    mustValidateTermsOfService: true,
    lastTermsOfServiceValidatedAt: null,
  };
  databaseBuilder.factory.buildUser.withUnencryptedPassword(userWithLastTermsOfServiceNotValidated);

  databaseBuilder.factory.buildUser.withUnencryptedPassword({
    id: 200,
    firstName: 'Pix',
    lastName: 'Masteur',
    rawPassword: defaultPassword,
    email: 'pixmasteur@example.net',
    cgu: true,
  });
}

module.exports = {
  usersBuilder,
  PIX_MASTER_ID,
};
