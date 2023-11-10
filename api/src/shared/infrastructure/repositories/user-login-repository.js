import { knex } from '../../../../db/knex-database-connection.js';
import { UserLogin } from '../../../authentication/domain/models/UserLogin.js';

const USER_LOGINS_TABLE_NAME = 'user-logins';

function _toDomain(userLoginDTO) {
  return new UserLogin({
    id: userLoginDTO.id,
    userId: userLoginDTO.userId,
    failureCount: userLoginDTO.failureCount,
    temporaryBlockedUntil: userLoginDTO.temporaryBlockedUntil,
    blockedAt: userLoginDTO.blockedAt,
    createdAt: userLoginDTO.createdAt,
    updatedAt: userLoginDTO.updatedAt,
  });
}

const findByUserId = async function (userId) {
  const foundUserLogin = await knex.from(USER_LOGINS_TABLE_NAME).where({ userId }).first();
  return foundUserLogin ? _toDomain(foundUserLogin) : null;
};

const create = async function (userLogin) {
  const [userLoginDTO] = await knex(USER_LOGINS_TABLE_NAME).insert(userLogin).returning('*');
  return _toDomain(userLoginDTO);
};

const update = async function (userLogin) {
  userLogin.updatedAt = new Date();
  const [userLoginDTO] = await knex(USER_LOGINS_TABLE_NAME)
    .where({ id: userLogin.id })
    .update(userLogin)
    .returning('*');
  return _toDomain(userLoginDTO);
};

const findByUsername = async function (username) {
  const foundUserLogin = await knex
    .select('user-logins.*')
    .from(USER_LOGINS_TABLE_NAME)
    .where('users.email', username.toLowerCase())
    .orWhere('users.username', username.toLowerCase())
    .join('users', 'users.id', 'user-logins.userId')
    .first();

  return foundUserLogin ? _toDomain(foundUserLogin) : null;
};

const updateLastLoggedAt = async function ({ userId }) {
  const now = new Date();

  await knex(USER_LOGINS_TABLE_NAME)
    .insert({
      userId,
      lastLoggedAt: now,
    })
    .onConflict('userId')
    .merge();
};

export { findByUserId, create, update, findByUsername, updateLastLoggedAt };
