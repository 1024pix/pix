/* eslint-disable no-sync */
const databaseBuffer = require('../database-buffer');
const buildUser = require('./build-user');
const encrypt = require('../../../lib/domain/services/encryption-service');
const isUndefined = require('lodash/isUndefined');
const faker = require('faker');
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

buildAuthenticationMethod.buildPasswordAuthenticationMethod = function({
  id,
  password,
  shouldChangePassword = false,
  userId,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
} = {}) {

  password = isUndefined(password) ? encrypt.hashPasswordSync(faker.internet.password()) : encrypt.hashPasswordSync(password);
  userId = isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
    authenticationComplement: new AuthenticationMethod.PasswordAuthenticationMethod({ password, shouldChangePassword }),
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

module.exports = buildAuthenticationMethod;
