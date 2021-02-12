/* eslint-disable no-sync */
const isUndefined = require('lodash/isUndefined');

const encrypt = require('../../../../lib/domain/services/encryption-service');
const User = require('../../../../lib/domain/models/User');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');

function _buildUser() {
  return new User({
    id: 456,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.net',
  });
}

const buildAuthenticationMethod = function({
  id = 123,
  identityProvider = AuthenticationMethod.identityProviders.GAR,
  externalIdentifier = `externalId${id}`,
  userId = 456,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
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
  rawPassword = 'pix123',
  shouldChangePassword = false,
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
} = {}) {

  const password = encrypt.hashPasswordSync(rawPassword);
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
  hashedPassword = 'hashedPassword',
  shouldChangePassword = false,
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
} = {}) {
  const password = hashedPassword;
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
  externalIdentifier = `externalId${id}`,
  accessToken = 'ABC456789',
  refreshToken = 'ZFGEADZA789',
  expiredDate = new Date('2022-01-01'),
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
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
