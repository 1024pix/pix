const PIX_MASTER_ID = 199;
const DEFAULT_PASSWORD = 'pix123';
const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');

function usersBuilder({ databaseBuilder }) {

  databaseBuilder.factory.buildUser.withRawPassword({
    id: 1,
    firstName: 'Pix',
    lastName: 'Aile',
    email: 'userpix1@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withRawPassword({
    id: PIX_MASTER_ID,
    firstName: 'Pix',
    lastName: 'Master',
    email: 'pixmaster@example.net',
    rawPassword: DEFAULT_PASSWORD,
    cgu: true,
  });

  databaseBuilder.factory.buildUser.withRawPassword({
    id: 10,
    firstName: 'Lance',
    lastName: 'Low',
    username: 'lance.low1234',
    rawPassword: DEFAULT_PASSWORD,
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
  databaseBuilder.factory.buildUser.withRawPassword(userShouldChangePassword);

  const userWithSamlId = databaseBuilder.factory.buildUser.withRawPassword({
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

  const userFromPoleEmploi = databaseBuilder.factory.buildUser.withRawPassword({
    firstName: 'Paul',
    lastName: 'Amplois',
    email: null,
    rawPassword: 'Password123',
    cgu: false,
  });

  databaseBuilder.factory.buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod({
    userId: userFromPoleEmploi.id,
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
  databaseBuilder.factory.buildUser.withRawPassword(userWithLastTermsOfServiceValidated);

  const userWithLastTermsOfServiceNotValidated = {
    firstName: 'lasttermsofservice',
    lastName: 'notValidated',
    email: 'lasttermsofservice@notvalidated.net',
    rawPassword: 'Password123',
    cgu: true,
    mustValidateTermsOfService: true,
    lastTermsOfServiceValidatedAt: null,
  };
  databaseBuilder.factory.buildUser.withRawPassword(userWithLastTermsOfServiceNotValidated);
}

module.exports = {
  usersBuilder,
  PIX_MASTER_ID,
  DEFAULT_PASSWORD,
};
