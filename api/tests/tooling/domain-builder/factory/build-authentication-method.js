import lodash from 'lodash';
const { isUndefined } = lodash;

import { DEFAULT_PASSWORD } from '../../../../db/constants.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../../src/identity-access-management/domain/constants/identity-providers.js';
import { AuthenticationMethod } from '../../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { User } from '../../../../src/identity-access-management/domain/models/User.js';
import { cryptoService } from '../../../../src/shared/domain/services/crypto-service.js';

// eslint-disable-next-line n/no-sync
const DEFAULT_HASHED_PASSWORD = cryptoService.hashPasswordSync(DEFAULT_PASSWORD);

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
  identityProvider = NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
  externalIdentifier = `externalId${id}`,
  userId = 456,
  userFirstName = 'Margotte',
  userLastName = 'Saint-James',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
  lastLoggedAt = null,
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
    lastLoggedAt,
  });
};

buildAuthenticationMethod.withPixAsIdentityProviderAndRawPassword = function ({
  id,
  rawPassword = DEFAULT_PASSWORD,
  shouldChangePassword = false,
  userId,
  createdAt,
  updatedAt,
  lastLoggedAt = null,
} = {}) {
  userId = isUndefined(userId) ? _buildUser().id : userId;

  return new AuthenticationMethod({
    id,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: _getHashedPassword(rawPassword),
      shouldChangePassword,
    }),
    externalIdentifier: undefined,
    userId,
    createdAt,
    updatedAt,
    lastLoggedAt,
  });
};

buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword = function ({
  id,
  hashedPassword = 'hashedPassword',
  shouldChangePassword = false,
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
  lastLoggedAt = null,
} = {}) {
  const password = hashedPassword;
  userId = isUndefined(userId) ? _buildUser().id : userId;

  return new AuthenticationMethod({
    id,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password,
      shouldChangePassword,
    }),
    externalIdentifier: undefined,
    userId,
    createdAt,
    updatedAt,
    lastLoggedAt,
  });
};

buildAuthenticationMethod.withOidcProviderAsIdentityProvider = function ({
  id,
  identityProviderCode = 'SOME_IDENTITY_PROVIDER',
  externalIdentifier = `externalId${id}`,
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-02'),
  lastLoggedAt = null,
} = {}) {
  userId = isUndefined(userId) ? _buildUser().id : userId;

  return new AuthenticationMethod({
    id,
    identityProvider: identityProviderCode,
    authenticationComplement: new AuthenticationMethod.OidcAuthenticationComplement(),
    externalIdentifier,
    userId,
    createdAt,
    updatedAt,
    lastLoggedAt,
  });
};

buildAuthenticationMethod.withIdentityProvider = function ({
  id,
  identityProvider,
  externalIdentifier = `externalId${id}`,
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-02-01'),
  lastLoggedAt = null,
} = {}) {
  userId = isUndefined(userId) ? _buildUser().id : userId;

  return new AuthenticationMethod({
    id,
    identityProvider,
    externalIdentifier,
    userId,
    createdAt,
    updatedAt,
    lastLoggedAt,
  });
};

function _getHashedPassword(password) {
  if (password === DEFAULT_PASSWORD) {
    return DEFAULT_HASHED_PASSWORD;
  }
  // eslint-disable-next-line n/no-sync
  return cryptoService.hashPasswordSync(password);
}

export { buildAuthenticationMethod };
