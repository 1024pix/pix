const isUndefined = require('lodash/isUndefined');
const databaseBuffer = require('../database-buffer');
const buildUser = require('./build-user');
const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');

const buildAuthenticationMethod = function({
  id = databaseBuffer.getNextId(),
  identityProvider = AuthenticationMethod.identityProviders.GAR,
  externalIdentifier = 'externalId',
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
} = {}) {

  userId = isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    identityProvider,
    externalIdentifier,
    authenticationComplement: undefined,
    userId,
    createdAt,
    updatedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'authentication-methods',
    values,
  });
};

buildAuthenticationMethod.buildWithHashedPassword = function({
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

buildAuthenticationMethod.buildPoleEmploiAuthenticationMethod = function({
  id = databaseBuffer.getNextId(),
  externalIdentifier = 'externalId',
  accessToken = 'ABC789',
  refreshToken = 'DEF753',
  expiredDate = new Date('2022-01-01'),
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
} = {}) {

  userId = isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
    authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({
      accessToken,
      refreshToken,
      expiredDate,
    }),
    externalIdentifier,
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
