/* eslint-disable no-sync */

const faker = require('faker');
const isUndefined = require('lodash/isUndefined');

const encrypt = require('../../../../lib/domain/services/encryption-service');
const User = require('../../../../lib/domain/models/User');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

function _buildUser() {
  return new User({
    id: faker.random.number(),
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.net',
  });
}

const buildAuthenticationMethod = function({
  id,
  identityProvider = AuthenticationMethod.identityProviders.GAR,
  externalIdentifier = faker.random.uuid(),
  userId,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
} = {}) {

  userId = isUndefined(userId) ? _buildUser().id : userId;

  return new AuthenticationMethod({
    id,
    identityProvider,
    externalIdentifier,
    authenticationComplement: null,
    userId,
    createdAt,
    updatedAt,
  });
};

buildAuthenticationMethod.buildWithRawPassword = function({
  id,
  rawPassword,
  shouldChangePassword = false,
  userId,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
} = {}) {

  const password = isUndefined(rawPassword) ? encrypt.hashPasswordSync(faker.internet.password()) : encrypt.hashPasswordSync(rawPassword);
  userId = isUndefined(userId) ? _buildUser().id : userId;

  return new AuthenticationMethod({
    id,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password,
      shouldChangePassword,
    }),
    externalIdentifier: undefined,
    userId,
    createdAt,
    updatedAt,
  });
};

buildAuthenticationMethod.buildWithHashedPassword = function({
  id,
  hashedPassword,
  shouldChangePassword = false,
  userId,
  createdAt = faker.date.past(),
  updatedAt = faker.date.past(),
} = {}) {
  const password = isUndefined(hashedPassword) ? encrypt.hashPasswordSync(faker.internet.password()) : hashedPassword;
  userId = isUndefined(userId) ? _buildUser().id : userId;

  return new AuthenticationMethod({
    id,
    identityProvider: AuthenticationMethod.identityProviders.PIX,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password,
      shouldChangePassword,
    }),
    externalIdentifier: undefined,
    userId,
    createdAt,
    updatedAt,
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

  userId = isUndefined(userId) ? _buildUser().id : userId;

  return new AuthenticationMethod({
    id,
    identityProvider: AuthenticationMethod.identityProviders.POLE_EMPLOI,
    authenticationComplement: new AuthenticationMethod.PoleEmploiAuthenticationComplement({ accessToken, refreshToken, expiredDate }),
    externalIdentifier,
    userId,
    createdAt,
    updatedAt,
  });
};

module.exports = buildAuthenticationMethod;
