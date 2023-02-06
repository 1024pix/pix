const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection');
const bookshelfUtils = require('../utils/knex-utils');
const DomainTransaction = require('../DomainTransaction');
const { AlreadyExistingEntityError, AuthenticationMethodNotFoundError } = require('../../domain/errors');
const AuthenticationMethod = require('../../domain/models/AuthenticationMethod');
const OidcIdentityProviders = require('../../domain/constants/oidc-identity-providers');

function _toDomain(authenticationMethodDTO) {
  if (authenticationMethodDTO.identityProvider === AuthenticationMethod.identityProviders.PIX) {
    authenticationMethodDTO.externalIdentifier = undefined;
  }
  const authenticationComplement = _toAuthenticationComplement(
    authenticationMethodDTO.identityProvider,
    authenticationMethodDTO.authenticationComplement
  );
  return new AuthenticationMethod({
    ...authenticationMethodDTO,
    externalIdentifier: authenticationMethodDTO.externalIdentifier,
    authenticationComplement,
  });
}

function _toAuthenticationComplement(identityProvider, bookshelfAuthenticationComplement) {
  if (identityProvider === AuthenticationMethod.identityProviders.PIX) {
    return new AuthenticationMethod.PixAuthenticationComplement(bookshelfAuthenticationComplement);
  }

  if (identityProvider === OidcIdentityProviders.POLE_EMPLOI.service.code) {
    return new AuthenticationMethod.OidcAuthenticationComplement(bookshelfAuthenticationComplement);
  }

  if (identityProvider === AuthenticationMethod.identityProviders.GAR) {
    const methodWasCreatedWithoutUserFirstAndLastName = bookshelfAuthenticationComplement === null;
    if (methodWasCreatedWithoutUserFirstAndLastName) {
      return undefined;
    }

    return new AuthenticationMethod.GARAuthenticationComplement(bookshelfAuthenticationComplement);
  }

  return undefined;
}

const AUTHENTICATION_METHODS_TABLE = 'authentication-methods';
const COLUMNS = Object.freeze([
  'id',
  'identityProvider',
  'authenticationComplement',
  'externalIdentifier',
  'userId',
  'createdAt',
  'updatedAt',
]);

module.exports = {
  async create({ authenticationMethod, domainTransaction = DomainTransaction.emptyTransaction() }) {
    try {
      const knexConn = domainTransaction.knexTransaction ?? knex;
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
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntityError(
          `An authentication method already exists for the user ID ${authenticationMethod.userId} and the externalIdentifier ${authenticationMethod.externalIdentifier}.`
        );
      }

      throw err;
    }
  },

  async createPasswordThatShouldBeChanged({
    userId,
    hashedPassword,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    try {
      const authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
        password: hashedPassword,
        shouldChangePassword: true,
      });
      const authenticationMethod = new AuthenticationMethod({
        authenticationComplement,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
        userId,
      });
      const authenticationMethodForDB = _.pick(authenticationMethod, [
        'identityProvider',
        'authenticationComplement',
        'externalIdentifier',
        'userId',
      ]);
      const knexConn = domainTransaction.knexTransaction ?? knex;
      const [authenticationMethodDTO] = await knexConn(AUTHENTICATION_METHODS_TABLE)
        .insert(authenticationMethodForDB)
        .returning(COLUMNS);
      return _toDomain(authenticationMethodDTO);
    } catch (err) {
      if (bookshelfUtils.isUniqConstraintViolated(err)) {
        throw new AlreadyExistingEntityError(`Authentication method PIX already exists for the user ID ${userId}.`);
      }
    }
  },

  async findOneByUserIdAndIdentityProvider({ userId, identityProvider }) {
    const authenticationMethodDTO = await knex
      .select(COLUMNS)
      .from(AUTHENTICATION_METHODS_TABLE)
      .where({ userId, identityProvider })
      .first();

    return authenticationMethodDTO ? _toDomain(authenticationMethodDTO) : null;
  },

  async findOneByExternalIdentifierAndIdentityProvider({ externalIdentifier, identityProvider }) {
    const authenticationMethodDTO = await knex
      .select(COLUMNS)
      .from(AUTHENTICATION_METHODS_TABLE)
      .where({ externalIdentifier, identityProvider })
      .first();

    return authenticationMethodDTO ? _toDomain(authenticationMethodDTO) : null;
  },

  async findByUserId({ userId }) {
    const authenticationMethodDTOs = await knex
      .select(COLUMNS)
      .from(AUTHENTICATION_METHODS_TABLE)
      .where({ userId })
      .orderBy('id', 'ASC');

    return authenticationMethodDTOs.map(_toDomain);
  },

  async getByIdAndUserId({ id, userId }) {
    const authenticationMethod = await knex.from(AUTHENTICATION_METHODS_TABLE).where({ id, userId }).first();
    if (!authenticationMethod) {
      throw new AuthenticationMethodNotFoundError(`Authentication method of id ${id} and user id ${userId} not found.`);
    }
    return _toDomain(authenticationMethod);
  },

  async hasIdentityProviderPIX({ userId }) {
    const authenticationMethodDTO = await knex
      .select(COLUMNS)
      .from(AUTHENTICATION_METHODS_TABLE)
      .where({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      })
      .first();

    return Boolean(authenticationMethodDTO);
  },

  async removeByUserIdAndIdentityProvider({ userId, identityProvider }) {
    return knex(AUTHENTICATION_METHODS_TABLE).where({ userId, identityProvider }).del();
  },

  async removeAllAuthenticationMethodsByUserId({ userId, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction.knexTransaction ?? knex;
    return knexConn(AUTHENTICATION_METHODS_TABLE).where({ userId }).del();
  },

  async updateChangedPassword({ userId, hashedPassword }, domainTransaction = DomainTransaction.emptyTransaction()) {
    const authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword: false,
    });

    const knexConn = domainTransaction.knexTransaction ?? knex;
    const [authenticationMethodDTO] = await knexConn(AUTHENTICATION_METHODS_TABLE)
      .where({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      })
      .update({ authenticationComplement, updatedAt: new Date() })
      .returning(COLUMNS);

    if (!authenticationMethodDTO) {
      throw new AuthenticationMethodNotFoundError(`Authentication method PIX for User ID ${userId} not found.`);
    }
    return _toDomain(authenticationMethodDTO);
  },

  async updatePasswordThatShouldBeChanged({
    userId,
    hashedPassword,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword: true,
    });

    const knexConn = domainTransaction.knexTransaction ?? knex;
    const [authenticationMethodDTO] = await knexConn(AUTHENTICATION_METHODS_TABLE)
      .where({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      })
      .update({ authenticationComplement, updatedAt: new Date() })
      .returning(COLUMNS);

    if (!authenticationMethodDTO) {
      throw new AuthenticationMethodNotFoundError(`Authentication method PIX for User ID ${userId} not found.`);
    }
    return _toDomain(authenticationMethodDTO);
  },

  async updateExpiredPassword({ userId, hashedPassword }) {
    const authenticationComplement = new AuthenticationMethod.PixAuthenticationComplement({
      password: hashedPassword,
      shouldChangePassword: false,
    });

    const [authenticationMethodDTO] = await knex(AUTHENTICATION_METHODS_TABLE)
      .where({
        userId,
        identityProvider: AuthenticationMethod.identityProviders.PIX,
      })
      .update({ authenticationComplement, updatedAt: new Date() })
      .returning(COLUMNS);

    if (!authenticationMethodDTO) {
      throw new AuthenticationMethodNotFoundError(`Authentication method PIX for User ID ${userId} not found.`);
    }
    return _toDomain(authenticationMethodDTO);
  },

  async updateExternalIdentifierByUserIdAndIdentityProvider({ externalIdentifier, userId, identityProvider }) {
    const [authenticationMethodDTO] = await knex(AUTHENTICATION_METHODS_TABLE)
      .where({ userId, identityProvider })
      .update({ externalIdentifier, updatedAt: new Date() })
      .returning(COLUMNS);

    if (!authenticationMethodDTO) {
      throw new AuthenticationMethodNotFoundError(
        `No rows updated for authentication method of type ${identityProvider} for user ${userId}.`
      );
    }
    return _toDomain(authenticationMethodDTO);
  },

  async updateAuthenticationComplementByUserIdAndIdentityProvider({
    authenticationComplement,
    userId,
    identityProvider,
  }) {
    const [authenticationMethodDTO] = await knex(AUTHENTICATION_METHODS_TABLE)
      .where({ userId, identityProvider })
      .update({ authenticationComplement, updatedAt: new Date() })
      .returning(COLUMNS);

    if (!authenticationMethodDTO) {
      throw new AuthenticationMethodNotFoundError(
        `No rows updated for authentication method of type ${identityProvider} for user ${userId}.`
      );
    }
    return _toDomain(authenticationMethodDTO);
  },

  async updateAuthenticationMethodUserId({ originUserId, identityProvider, targetUserId }) {
    await knex(AUTHENTICATION_METHODS_TABLE)
      .where({ userId: originUserId, identityProvider })
      .update({ userId: targetUserId, updatedAt: new Date() });
  },

  async update({ id, authenticationComplement }) {
    await knex(AUTHENTICATION_METHODS_TABLE).where({ id }).update({ authenticationComplement, updatedAt: new Date() });
  },
};
