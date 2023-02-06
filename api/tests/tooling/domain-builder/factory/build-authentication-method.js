const isUndefined = require('lodash/isUndefined');

const encrypt = require('../../../../lib/domain/services/encryption-service');
const User = require('../../../../lib/domain/models/User');
const AuthenticationMethod = require('../../../../lib/domain/models/AuthenticationMethod');
const OidcIdentityProviders = require('../../../../lib/domain/constants/oidc-identity-providers');

function _buildUser() {
  return new User({
    id: 456,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.net',
  });
}

const buildAuthenticationMethod = {};

buildAuthenticationMethod.withGarAsIdentityProvider = function ({
  id = 123,
  identityProvider = AuthenticationMethod.identityProviders.GAR,
  externalIdentifier = `externalId${id}`,
  userId = 456,
  userFirstName = 'Margotte',
  userLastName = 'Saint-James',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
} = {}) {
  userId = isUndefined(userId) ? _buildUser().id : userId;

  return new AuthenticationMethod({
    id,
    identityProvider,
    externalIdentifier,
    authenticationComplement: new AuthenticationMethod.GARAuthenticationComplement({
      firstName: userFirstName,
      lastName: userLastName,
    }),
    userId,
    createdAt,
    updatedAt,
  });
};

buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword = function ({
  id,
  rawPassword = 'pix123',
  shouldChangePassword = false,
  userId,
  createdAt,
  updatedAt,
} = {}) {
  // eslint-disable-next-line no-sync
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

buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword = function ({
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

buildAuthenticationMethod.withPoleEmploiAsIdentityProvider = function ({
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
    identityProvider: OidcIdentityProviders.POLE_EMPLOI.service.code,
    authenticationComplement: new AuthenticationMethod.OidcAuthenticationComplement({
      accessToken,
      refreshToken,
      expiredDate,
    }),
    externalIdentifier,
    userId,
    createdAt,
    updatedAt,
  });
};

buildAuthenticationMethod.withIdentityProvider = function ({
  id,
  identityProvider,
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
    identityProvider,
    authenticationComplement: new AuthenticationMethod.OidcAuthenticationComplement({
      accessToken,
      refreshToken,
      expiredDate,
    }),
    externalIdentifier,
    userId,
    createdAt,
    updatedAt,
  });
};

module.exports = buildAuthenticationMethod;
