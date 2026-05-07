import lodash from 'lodash';
const { isUndefined } = lodash;
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../src/identity-access-management/domain/constants/identity-providers.js';
import * as OidcIdentityProviders from '../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import { AuthenticationMethod } from '../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';
import { DEFAULT_PASSWORD } from '../../constants.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildUser } from './build-user.js';

// eslint-disable-next-line n/no-sync
const DEFAULT_HASHED_PASSWORD = cryptoService.hashPasswordSync(DEFAULT_PASSWORD);

const buildAuthenticationMethod = {};

buildAuthenticationMethod.withGarAsIdentityProvider = function ({
  id = databaseBuffer.getNextId(),
  identityProvider = NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
  externalIdentifier = 'externalId',
  userId,
  userFirstName = 'Margotte',
  userLastName = 'Saint-James',
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  lastLoggedAt = new Date(),
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
    lastLoggedAt,
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
  lastLoggedAt = new Date(),
} = {}) {
  userId = isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword,
    }),
    externalIdentifier: undefined,
    userId,
    createdAt,
    updatedAt,
    lastLoggedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'authentication-methods',
    values,
  });
};

buildAuthenticationMethod.withPixAsIdentityProviderAndPassword = function ({
  id = databaseBuffer.getNextId(),
  password = DEFAULT_PASSWORD,
  shouldChangePassword = false,
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  lastLoggedAt = new Date(),
} = {}) {
  userId = isUndefined(userId) ? buildUser().id : userId;

  const values = {
    id,
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    authenticationComplement: new AuthenticationMethod.PixAuthenticationComplement({
      password: getUserHashedPassword(password),
      shouldChangePassword,
    }),
    externalIdentifier: undefined,
    userId,
    createdAt,
    updatedAt,
    lastLoggedAt,
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
  lastLoggedAt = new Date(),
} = {}) {
  userId = isUndefined(userId) ? buildUser().id : userId;

  let generatedIdentifier = externalIdentifier;
  if (!generatedIdentifier) {
    generatedIdentifier = `externalIdentifier-${id}`;
  }
  const values = {
    id,
    identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
    authenticationComplement: new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
      accessToken,
      refreshToken,
      expiredDate,
    }),
    externalIdentifier: generatedIdentifier,
    userId,
    createdAt,
    updatedAt,
    lastLoggedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'authentication-methods',
    values,
  });
};

buildAuthenticationMethod.withOidcProviderAsIdentityProvider = function ({
  id = databaseBuffer.getNextId(),
  externalIdentifier,
  userId,
  identityProvider,
  authenticationComplement,
  lastLoggedAt = new Date(),
}) {
  userId = isUndefined(userId) ? buildUser().id : userId;

  let generatedIdentifier = externalIdentifier;
  if (!generatedIdentifier) {
    generatedIdentifier = `externalIdentifier-${id}`;
  }
  const values = {
    id,
    identityProvider,
    externalIdentifier: generatedIdentifier,
    userId,
    authenticationComplement:
      authenticationComplement ??
      new AuthenticationMethod.OidcAuthenticationComplement({
        firstName: 'oidc',
        lastName: 'user',
      }),
    createdAt: new Date('2020-01-01'),
    updatedAt: new Date('2020-01-02'),
    lastLoggedAt,
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
  userId,
  createdAt = new Date('2020-01-01'),
  updatedAt = new Date('2020-01-02'),
  lastLoggedAt = new Date(),
} = {}) {
  userId = isUndefined(userId) ? buildUser().id : userId;

  let generatedIdentifier = externalIdentifier;
  if (!generatedIdentifier) {
    generatedIdentifier = `externalIdentifier-${id}`;
  }
  const values = {
    id,
    identityProvider,
    externalIdentifier: generatedIdentifier,
    userId,
    createdAt,
    updatedAt,
    lastLoggedAt,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'authentication-methods',
    values,
  });
};

function getUserHashedPassword(password) {
  if (password === DEFAULT_PASSWORD) {
    return DEFAULT_HASHED_PASSWORD;
  }
  // eslint-disable-next-line n/no-sync
  return cryptoService.hashPasswordSync(password);
}

export { buildAuthenticationMethod, getUserHashedPassword };
