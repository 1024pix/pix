/* eslint-disable no-sync */
const faker = require('faker');
const isUndefined = require('lodash/isUndefined');

const databaseBuffer = require('../database-buffer');
const buildUser = require('./build-user');
const AuthenticationMethod = require('../../../lib/domain/models/AuthenticationMethod');

const buildAuthenticationMethod = function({
  id,
  identityProvider = AuthenticationMethod.identityProviders.GAR,
  externalIdentifier = faker.random.word(),
  userId,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
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
  id,
  hashedPassword = 'ABCDEF123',
  shouldChangePassword = false,
  userId,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
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
  id,
  externalIdentifier = faker.random.word(),
  accessToken = faker.random.uuid(),
  refreshToken = faker.random.uuid(),
  expiredDate = faker.date.recent(),
  userId,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
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
