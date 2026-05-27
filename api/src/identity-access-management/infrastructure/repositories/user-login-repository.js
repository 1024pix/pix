import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { UserLogin } from '../../domain/models/UserLogin.js';

const USER_LOGINS_TABLE_NAME = 'user-logins';

const findByUserId = async function (userId) {
  const knexConn = DomainTransaction.getConnection();
  const userLoginDTO = await knexConn.from(USER_LOGINS_TABLE_NAME).where({ userId }).first();
  return userLoginDTO ? _toDomain(userLoginDTO) : null;
};

const getByUserId = async function (userId) {
  const foundUserLogin = await findByUserId(userId);
  if (!foundUserLogin) {
    throw new NotFoundError();
  }

  return foundUserLogin;
};

const create = async function (userLogin) {
  const knexConn = DomainTransaction.getConnection();
  const [userLoginDTO] = await knexConn(USER_LOGINS_TABLE_NAME).insert(userLogin).returning('*');
  return _toDomain(userLoginDTO);
};

const update = async function (userLogin, { preventUpdatedAt } = {}) {
  const knexConn = DomainTransaction.getConnection();

  if (!preventUpdatedAt) {
    userLogin.updatedAt = new Date();
  }

  const [userLoginDTO] = await knexConn(USER_LOGINS_TABLE_NAME)
    .where({ id: userLogin.id })
    .update(userLogin)
    .returning('*');
  return _toDomain(userLoginDTO);
};

const findByUsername = async function (username) {
  const knexConn = DomainTransaction.getConnection();
  const userLoginDTO = await knexConn
    .select('user-logins.*')
    .from(USER_LOGINS_TABLE_NAME)
    .where('users.email', username.toLowerCase())
    .orWhere('users.username', username.toLowerCase())
    .join('users', 'users.id', 'user-logins.userId')
    .first();

  return userLoginDTO ? _toDomain(userLoginDTO) : null;
};

const updateLastLoggedAt = async function ({ userId }) {
  const now = new Date();

  const knexConn = DomainTransaction.getConnection();
  await knexConn(USER_LOGINS_TABLE_NAME)
    .insert({
      userId,
      lastLoggedAt: now,
    })
    .onConflict('userId')
    .merge();
};

const batchUnblock = async function (userIds) {
  const now = new Date();

  const knexConn = DomainTransaction.getConnection();
  await knexConn(USER_LOGINS_TABLE_NAME)
    .update({
      failureCount: 0,
      temporaryBlockedUntil: null,
      blockedAt: null,
      updatedAt: now,
    })
    .whereIn('userId', userIds);
};

export { batchUnblock, create, findByUserId, findByUsername, getByUserId, update, updateLastLoggedAt };

function _toDomain(userLoginDTO) {
  return new UserLogin({
    id: userLoginDTO.id,
    userId: userLoginDTO.userId,
    failureCount: userLoginDTO.failureCount,
    temporaryBlockedUntil: userLoginDTO.temporaryBlockedUntil,
    blockedAt: userLoginDTO.blockedAt,
    createdAt: userLoginDTO.createdAt,
    updatedAt: userLoginDTO.updatedAt,
    lastLoggedAt: userLoginDTO.lastLoggedAt,
  });
}
