import { NON_OIDC_IDENTITY_PROVIDERS } from '../../../src/identity-access-management/domain/constants/identity-providers.js';
import * as OidcIdentityProviders from '../../../src/identity-access-management/domain/constants/oidc-identity-providers.js';
import { AuthenticationMethod } from '../../../src/identity-access-management/domain/models/AuthenticationMethod.js';
import { cryptoService } from '../../../src/shared/domain/services/crypto-service.js';
import { DEFAULT_PASSWORD } from '../../constants.js';
import { databaseBuffer } from '../database-buffer.ts';
import { buildUser } from './build-user.ts';

// eslint-disable-next-line n/no-sync
const DEFAULT_HASHED_PASSWORD = cryptoService.hashPasswordSync(DEFAULT_PASSWORD);

const TABLE_NAME = 'authentication-methods';

type AuthenticationMethodAttributes = {
  id?: number;
  userId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoggedAt?: Date | null;
};

const getUserHashedPassword = (password: string): string => {
  if (password === DEFAULT_PASSWORD) {
    return DEFAULT_HASHED_PASSWORD;
  }
  // eslint-disable-next-line n/no-sync
  return cryptoService.hashPasswordSync(password);
};

const buildAuthenticationMethod = {
  withGarAsIdentityProvider: ({
    id = databaseBuffer.getNextId(),
    identityProvider = NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    externalIdentifier = 'externalId',
    userId = buildUser().id,
    userFirstName = 'Margotte',
    userLastName = 'Saint-James',
    createdAt = new Date('2020-01-01'),
    updatedAt = new Date('2020-01-02'),
    lastLoggedAt = new Date(),
  }: AuthenticationMethodAttributes & {
    identityProvider?: string;
    externalIdentifier?: string;
    userFirstName?: string;
    userLastName?: string;
  } = {}) => {
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
    return databaseBuffer.pushInsertable({ tableName: TABLE_NAME, values });
  },

  withPixAsIdentityProviderAndHashedPassword: ({
    id = databaseBuffer.getNextId(),
    hashedPassword = 'ABCDEF123',
    shouldChangePassword = false,
    userId = buildUser().id,
    createdAt = new Date('2020-01-01'),
    updatedAt = new Date('2020-01-02'),
    lastLoggedAt = new Date(),
  }: AuthenticationMethodAttributes & { hashedPassword?: string; shouldChangePassword?: boolean } = {}) => {
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
    return databaseBuffer.pushInsertable({ tableName: TABLE_NAME, values });
  },

  withPixAsIdentityProviderAndPassword: ({
    id = databaseBuffer.getNextId(),
    password = DEFAULT_PASSWORD,
    shouldChangePassword = false,
    userId = buildUser().id,
    createdAt = new Date('2020-01-01'),
    updatedAt = new Date('2020-01-02'),
    lastLoggedAt = new Date(),
  }: AuthenticationMethodAttributes & { password?: string; shouldChangePassword?: boolean } = {}) => {
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
    return databaseBuffer.pushInsertable({ tableName: TABLE_NAME, values });
  },

  withPoleEmploiAsIdentityProvider: ({
    id = databaseBuffer.getNextId(),
    externalIdentifier,
    accessToken = 'ABC789',
    refreshToken = 'DEF753',
    expiredDate = new Date('2022-01-01'),
    userId = buildUser().id,
    createdAt = new Date('2020-01-01'),
    updatedAt = new Date('2020-01-02'),
    lastLoggedAt = new Date(),
  }: AuthenticationMethodAttributes & {
    externalIdentifier?: string;
    accessToken?: string;
    refreshToken?: string;
    expiredDate?: Date;
  } = {}) => {
    const values = {
      id,
      identityProvider: OidcIdentityProviders.POLE_EMPLOI.code,
      authenticationComplement: new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement({
        accessToken,
        refreshToken,
        expiredDate,
      }),
      externalIdentifier: externalIdentifier || `externalIdentifier-${id}`,
      userId,
      createdAt,
      updatedAt,
      lastLoggedAt,
    };
    return databaseBuffer.pushInsertable({ tableName: TABLE_NAME, values });
  },

  withOidcProviderAsIdentityProvider: ({
    id = databaseBuffer.getNextId(),
    externalIdentifier,
    userId = buildUser().id,
    identityProvider,
    authenticationComplement,
    lastLoggedAt = new Date(),
  }: AuthenticationMethodAttributes & {
    externalIdentifier?: string;
    identityProvider: string;
    authenticationComplement?: object;
  }) => {
    const values = {
      id,
      identityProvider,
      externalIdentifier: externalIdentifier || `externalIdentifier-${id}`,
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
    return databaseBuffer.pushInsertable({ tableName: TABLE_NAME, values });
  },

  withIdentityProvider: ({
    id = databaseBuffer.getNextId(),
    identityProvider,
    externalIdentifier,
    userId = buildUser().id,
    createdAt = new Date('2020-01-01'),
    updatedAt = new Date('2020-01-02'),
    lastLoggedAt = new Date(),
  }: AuthenticationMethodAttributes & { identityProvider?: string; externalIdentifier?: string } = {}) => {
    const values = {
      id,
      identityProvider,
      externalIdentifier: externalIdentifier || `externalIdentifier-${id}`,
      userId,
      createdAt,
      updatedAt,
      lastLoggedAt,
    };
    return databaseBuffer.pushInsertable({ tableName: TABLE_NAME, values });
  },
};

export { buildAuthenticationMethod, getUserHashedPassword };
