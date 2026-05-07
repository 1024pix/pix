import _ from 'lodash';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AlreadyExistingEntityError, AuthenticationMethodNotFoundError } from '../../../shared/domain/errors.js';
import * as knexUtils from '../../../shared/infrastructure/utils/knex-utils.js';
import { NON_OIDC_IDENTITY_PROVIDERS } from '../../domain/constants/identity-providers.js';
import * as OidcIdentityProviders from '../../domain/constants/oidc-identity-providers.js';
import { AuthenticationMethod } from '../../domain/models/AuthenticationMethod.js';

const AUTHENTICATION_METHODS_TABLE = 'authentication-methods';
const COLUMNS = Object.freeze([
  'id',
  'identityProvider',
  'authenticationComplement',
  'externalIdentifier',
  'userId',
  'createdAt',
  'updatedAt',
  'lastLoggedAt',
]);

const create = async function ({ authenticationMethod }) {
  try {
    const knexConn = DomainTransaction.getConnection();
    const authenticationMethodForDB = _.pick(authenticationMethod, [
      'identityProvider',
      'authenticationComplement',
      'externalIdentifier',
      'userId',
    ]);
    const [authenticationMethodDTO] = await knexConn(AUTHENTICATION_METHODS_TABLE)
      .insert(authenticationMethodForDB)
      .returning(COLUMNS);
    return _toDomain(authenticationMethodDTO);
  } catch (err) {
    if (knexUtils.isUniqConstraintViolated(err)) {
      throw new AlreadyExistingEntityError(
        `An authentication method already exists for the user ID ${authenticationMethod.userId} and the identityProvider ${authenticationMethod.identityProvider}.`,
      );
    }

    throw err;
  }
};

const createPasswordThatShouldBeChanged = async function ({ userId, hashedPassword }) {
  try {
    const authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword: true,
    });
    const authenticationMethod = new AuthenticationMethod({
      authenticationComplement,
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
      userId,
    });
    const authenticationMethodForDB = _.pick(authenticationMethod, [
      'identityProvider',
      'authenticationComplement',
      'externalIdentifier',
      'userId',
    ]);
    const knexConn = DomainTransaction.getConnection();
    const [authenticationMethodDTO] = await knexConn(AUTHENTICATION_METHODS_TABLE)
      .insert(authenticationMethodForDB)
      .returning(COLUMNS);
    return _toDomain(authenticationMethodDTO);
  } catch (err) {
    if (knexUtils.isUniqConstraintViolated(err)) {
      throw new AlreadyExistingEntityError(`Authentication method PIX already exists for the user ID ${userId}.`);
    }
  }
};

const findOneByUserIdAndIdentityProvider = async function ({ userId, identityProvider }) {
  const knexConn = DomainTransaction.getConnection();
  const authenticationMethodDTO = await knexConn
    .select(COLUMNS)
    .from(AUTHENTICATION_METHODS_TABLE)
    .where({ userId, identityProvider })
    .first();

  return authenticationMethodDTO ? _toDomain(authenticationMethodDTO) : null;
};

const findOneByExternalIdentifierAndIdentityProvider = async function ({ externalIdentifier, identityProvider }) {
  const knexConn = DomainTransaction.getConnection();
  const authenticationMethodDTO = await knexConn
    .select(COLUMNS)
    .from(AUTHENTICATION_METHODS_TABLE)
    .where({ externalIdentifier, identityProvider })
    .first();

  return authenticationMethodDTO ? _toDomain(authenticationMethodDTO) : null;
};

const findByUserId = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const authenticationMethodDTOs = await knexConn
    .select(COLUMNS)
    .from(AUTHENTICATION_METHODS_TABLE)
    .where({ userId })
    .orderBy('id', 'ASC');

  return authenticationMethodDTOs.map(_toDomain);
};

const getByIdAndUserId = async function ({ id, userId }) {
  const knexConn = DomainTransaction.getConnection();
  const authenticationMethod = await knexConn.from(AUTHENTICATION_METHODS_TABLE).where({ id, userId }).first();
  if (!authenticationMethod) {
    throw new AuthenticationMethodNotFoundError(`Authentication method of id ${id} and user id ${userId} not found.`);
  }
  return _toDomain(authenticationMethod);
};

const hasIdentityProviderPIX = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const authenticationMethodDTO = await knexConn
    .select(COLUMNS)
    .from(AUTHENTICATION_METHODS_TABLE)
    .where({
      userId,
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    })
    .first();

  return Boolean(authenticationMethodDTO);
};

const findAllOidcAuthenticationMethodsByUser = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const oidcAuthenticationMethods = await knexConn
    .select(COLUMNS)
    .from(AUTHENTICATION_METHODS_TABLE)
    .where({ userId })
    .whereNotIn('identityProvider', [NON_OIDC_IDENTITY_PROVIDERS.PIX.code, NON_OIDC_IDENTITY_PROVIDERS.GAR.code]);

  return oidcAuthenticationMethods;
};

const hasIdentityProviderGar = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  const authenticationMethodDTO = await knexConn
    .select(COLUMNS)
    .from(AUTHENTICATION_METHODS_TABLE)
    .where({
      userId,
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.GAR.code,
    })
    .first();

  return Boolean(authenticationMethodDTO);
};

const updateLastLoggedAtByIdentityProvider = async function ({ userId, identityProvider }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(AUTHENTICATION_METHODS_TABLE)
    .where({
      userId,
      identityProvider,
    })
    .update({ lastLoggedAt: new Date() });
};

const removeByUserIdAndIdentityProvider = async function ({ userId, identityProvider }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(AUTHENTICATION_METHODS_TABLE).where({ userId, identityProvider }).del();
};

const removeAllAuthenticationMethodsByUserId = async function ({ userId }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn(AUTHENTICATION_METHODS_TABLE).where({ userId }).del();
};

const updatePassword = async function ({ userId, hashedPassword, shouldChangePassword = false }) {
  const knexConn = DomainTransaction.getConnection();
  const authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
    password: hashedPassword,
    shouldChangePassword,
  });

  const [authenticationMethodDTO] = await knexConn(AUTHENTICATION_METHODS_TABLE)
    .where({
      userId,
      identityProvider: NON_OIDC_IDENTITY_PROVIDERS.PIX.code,
    })
    .update({ authenticationComplement, updatedAt: new Date() })
    .returning(COLUMNS);

  if (!authenticationMethodDTO) {
    throw new AuthenticationMethodNotFoundError(`Authentication method PIX for User ID ${userId} not found.`);
  }
  return _toDomain(authenticationMethodDTO);
};

const updateExternalIdentifierByUserIdAndIdentityProvider = async function ({
  externalIdentifier,
  userId,
  identityProvider,
}) {
  const knexConn = DomainTransaction.getConnection();
  const [authenticationMethodDTO] = await knexConn(AUTHENTICATION_METHODS_TABLE)
    .where({ userId, identityProvider })
    .update({ externalIdentifier, updatedAt: new Date() })
    .returning(COLUMNS);

  if (!authenticationMethodDTO) {
    throw new AuthenticationMethodNotFoundError(
      `No rows updated for authentication method of type ${identityProvider} for user ${userId}.`,
    );
  }
  return _toDomain(authenticationMethodDTO);
};

const updateAuthenticationComplementByUserIdAndIdentityProvider = async function ({
  authenticationComplement,
  userId,
  identityProvider,
}) {
  const knexConn = DomainTransaction.getConnection();
  const [authenticationMethodDTO] = await knexConn(AUTHENTICATION_METHODS_TABLE)
    .where({ userId, identityProvider })
    .update({ authenticationComplement, updatedAt: new Date() })
    .returning(COLUMNS);

  if (!authenticationMethodDTO) {
    throw new AuthenticationMethodNotFoundError(
      `No rows updated for authentication method of type ${identityProvider} for user ${userId}.`,
    );
  }
  return _toDomain(authenticationMethodDTO);
};

const updateAuthenticationMethodUserId = async function ({ originUserId, identityProvider, targetUserId }) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn(AUTHENTICATION_METHODS_TABLE)
    .where({ userId: originUserId, identityProvider })
    .update({ userId: targetUserId, updatedAt: new Date(), lastLoggedAt: null });
};

const update = async function ({ id, authenticationComplement }) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn(AUTHENTICATION_METHODS_TABLE)
    .where({ id })
    .update({ authenticationComplement, updatedAt: new Date() });
};

const batchUpsertPasswordThatShouldBeChanged = async function ({ usersToUpdateWithNewPassword }) {
  for (const { userId, hashedPassword } of usersToUpdateWithNewPassword) {
    if (await hasIdentityProviderPIX({ userId })) {
      await updatePassword({ userId, hashedPassword, shouldChangePassword: true });
    } else {
      await createPasswordThatShouldBeChanged({ userId, hashedPassword });
    }
  }
};

/**
 * @param {number[]} userIds
 * @param {Object} dependencies
 * @returns {Promise<{garAnonymizedUserIds: number}>}
 */
const anonymizeByUserIds = async function ({ userIds }) {
  const knexConn = DomainTransaction.getConnection();

  const anonymizedUserIdBatch = await knexConn(AUTHENTICATION_METHODS_TABLE)
    .whereIn('userId', userIds)
    .andWhere('identityProvider', 'GAR')
    .update({
      authenticationComplement: { firstName: 'anonymized', lastName: 'anonymized' },
      updatedAt: knexConn.fn.now(),
      externalIdentifier: knexConn.raw('CONCAT(\'anonymized-\', "authentication-methods".id)'),
    })
    .returning('userId');

  return { garAnonymizedUserIds: anonymizedUserIdBatch.map(({ userId }) => userId) };
};

/**
 *
 * @param {number[]} userIds
 * @param {string} identityProvider
 * @returns {Promise<*>}
 */
const findByUserIdsAndIdentityProvider = async ({ userIds, identityProvider }) => {
  const knexConn = DomainTransaction.getConnection();

  const authenticationMethodDTOs = await knexConn
    .select(COLUMNS)
    .from(AUTHENTICATION_METHODS_TABLE)
    .whereIn('userId', userIds)
    .where({ identityProvider });

  return authenticationMethodDTOs.map(_toDomain);
};

/**
 * @typedef {Object} AuthenticationMethodRepository
 * @property {function} batchUpsertPasswordThatShouldBeChanged
 * @property {function} create
 * @property {function} createPasswordThatShouldBeChanged
 * @property {function} findByUserId
 * @property {function} findOneByExternalIdentifierAndIdentityProvider
 * @property {function} findOneByUserIdAndIdentityProvider
 * @property {function} getByIdAndUserId
 * @property {function} hasIdentityProviderPIX
 * @property {function} hasIdentityProviderGar
 * @property {function} removeAllAuthenticationMethodsByUserId
 * @property {function} removeByUserIdAndIdentityProvider
 * @property {function} findAllOidcAuthenticationMethodsByUser
 * @property {function} findByUserIdsAndIdentityProvider
 * @property {function} update
 * @property {function} updateAuthenticationComplementByUserIdAndIdentityProvider
 * @property {function} updateAuthenticationMethodUserId
 * @property {function} updatePassword
 * @property {function} updateExternalIdentifierByUserIdAndIdentityProvider
 */
export {
  anonymizeByUserIds,
  batchUpsertPasswordThatShouldBeChanged,
  create,
  createPasswordThatShouldBeChanged,
  findAllOidcAuthenticationMethodsByUser,
  findByUserId,
  findByUserIdsAndIdentityProvider,
  findOneByExternalIdentifierAndIdentityProvider,
  findOneByUserIdAndIdentityProvider,
  getByIdAndUserId,
  hasIdentityProviderGar,
  hasIdentityProviderPIX,
  removeAllAuthenticationMethodsByUserId,
  removeByUserIdAndIdentityProvider,
  update,
  updateAuthenticationComplementByUserIdAndIdentityProvider,
  updateAuthenticationMethodUserId,
  updateExternalIdentifierByUserIdAndIdentityProvider,
  updateLastLoggedAtByIdentityProvider,
  updatePassword,
};

function _toDomain(authenticationMethodDTO) {
  if (authenticationMethodDTO.identityProvider === NON_OIDC_IDENTITY_PROVIDERS.PIX.code) {
    authenticationMethodDTO.externalIdentifier = undefined;
  }
  const authenticationComplement = _toAuthenticationComplement(
    authenticationMethodDTO.identityProvider,
    authenticationMethodDTO.authenticationComplement,
  );
  return new AuthenticationMethod({
    ...authenticationMethodDTO,
    externalIdentifier: authenticationMethodDTO.externalIdentifier,
    authenticationComplement,
  });
}

function _toAuthenticationComplement(identityProvider, authenticationComplement) {
  if (identityProvider === NON_OIDC_IDENTITY_PROVIDERS.PIX.code) {
    return new AuthenticationMethod.PixAuthenticationComplement(authenticationComplement);
  }

  if (identityProvider === OidcIdentityProviders.POLE_EMPLOI.code) {
    return new AuthenticationMethod.PoleEmploiOidcAuthenticationComplement(authenticationComplement);
  }

  if (identityProvider === NON_OIDC_IDENTITY_PROVIDERS.GAR.code) {
    const methodWasCreatedWithoutUserFirstAndLastName = authenticationComplement === null;
    if (methodWasCreatedWithoutUserFirstAndLastName) {
      return undefined;
    }

    return new AuthenticationMethod.GARAuthenticationComplement(authenticationComplement);
  }

  return new AuthenticationMethod.OidcAuthenticationComplement(authenticationComplement);
}
