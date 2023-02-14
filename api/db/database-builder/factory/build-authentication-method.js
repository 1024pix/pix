const isUndefined = require('lodash/isUndefined');
const databaseBuffer = require('../database-buffer');
const buildUser = require('./build-user');
const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');
const OidcIdentityProviders = require('../../../lib/domain/constants/oidc-identity-providers');
const encrypt = require('../../../lib/domain/services/encryption-service');

const buildAuthenticationMethod = {};

buildAuthenticationMethod.withGarAsIdentityProvider = function ({
  id = databaseBuffer.getNextId(),
  identityProvider = AuthenticationMethod.identityProviders.GAR,
  externalIdentifier = 'externalId',
  userId,
  userFirstName = 'Margotte',
  userLastName = 'Saint-James',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
} = {}) {
  userId = isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    identityProvider,
    externalIdentifier,
    authenticationComplement: {
      firstName: userFirstName,
      lastName: userLastName,
    },
    userId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'authentication-methods',
    values,
  });
};

buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword = function ({
  id = databaseBuffer.getNextId(),
  hashedPassword = 'ABCDEF123',
  shouldChangePassword = false,
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
} = {}) {
  userId = isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword,
    }),
    externalIdentifier: undefined,
    userId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'authentication-methods',
    values,
  });
};

buildAuthenticationMethod.withPixAsIdentityProviderAndPassword = function ({
  id = databaseBuffer.getNextId(),
  password = 'Password123',
  shouldChangePassword = false,
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
} = {}) {
  // eslint-disable-next-line no-sync
  const hashedPassword = encrypt.hashPasswordSync(password);
  userId = isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword,
    }),
    externalIdentifier: undefined,
    userId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'authentication-methods',
    values,
  });
};

buildAuthenticationMethod.withPoleEmploiAsIdentityProvider = function ({
  id = databaseBuffer.getNextId(),
  externalIdentifier,
  accessToken = 'ABC789',
  refreshToken = 'DEF753',
  expiredDate = new Date('2022-01-01'),
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
} = {}) {
  userId = isUndefined(userId) ? buildUser().id : userId;

  let generatedIdentifier = externalIdentifier;
  if (!generatedIdentifier) {
    generatedIdentifier = `externalIdentifier-${id}`;
  }
  const values = {
    id,
    identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code,
    authenticationComplement: new AuthenticationMethod.OidcAuthenticationComplement({
      accessToken,
      refreshToken,
      expiredDate,
    }),
    externalIdentifier: generatedIdentifier,
    userId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'authentication-methods',
    values,
  });
};

buildAuthenticationMethod.withIdentityProvider = function ({
  id = databaseBuffer.getNextId(),
  identityProvider,
  externalIdentifier,
  accessToken = 'ABC789',
  refreshToken = 'DEF753',
  expiredDate = new Date('2022-01-01'),
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
} = {}) {
  userId = isUndefined(userId) ? buildUser().id : userId;

  let generatedIdentifier = externalIdentifier;
  if (!generatedIdentifier) {
    generatedIdentifier = `externalIdentifier-${id}`;
  }
  const values = {
    id,
    identityProvider,
    authenticationComplement: new AuthenticationMethod.OidcAuthenticationComplement({
      accessToken,
      refreshToken,
      expiredDate,
    }),
    externalIdentifier: generatedIdentifier,
    userId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'authentication-methods',
    values,
  });
};

module.exports = buildAuthenticationMethod;
