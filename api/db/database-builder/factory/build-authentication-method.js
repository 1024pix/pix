import lodash from 'lodash';
const { isUndefined } = lodash;
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../src/identity-access-management/domain/constants/identity-providers.js';
import * as OidcIdentityProviders from '../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import { AuthenticationMethod } from '../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildUser } from './build-user.js';

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
    identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
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
  const hashedPassword = cryptoService.hashPasswordSync(password);
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
  };
  return databaseBuffer.pushInsertable({
    tableName: 'authentication-methods',
    values,
  });
};

export { buildAuthenticationMethod };
