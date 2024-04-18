import { knex } from '../../../../db/knex-database-connection.js';
import { UserLogin } from '../../../authentication/domain/models/UserLogin.js';
import { NotFoundError } from '../../../shared/domain/errors.js';

const USER_LOGINS_TABLE_NAME = 'user-logins';

/**
 * @param {object} userLoginDTO
 * @return {UserLogin}
 * @private
 */
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

/**
 * @typedef findByUserId
 * @type {function}
 * @param {string|number} userId
 * @return {Promise<UserLogin|null>}
 */
const findByUserId = async function (userId) {
  const userLoginDTO = await knex.from(USER_LOGINS_TABLE_NAME).where({ userId }).first();
  return userLoginDTO ? _toDomain(userLoginDTO) : null;
};

const getByUserId = async function (userId) {
  const foundUserLogin = await findByUserId(userId);
  if (!foundUserLogin) {
    throw new NotFoundError();
  }

  return foundUserLogin;
};

/**
 * @typedef create
 * @type {function}
 * @param {UserLogin} userLogin
 * @return {Promise<UserLogin>}
 */
const create = async function (userLogin) {
  const [userLoginDTO] = await knex(USER_LOGINS_TABLE_NAME).insert(userLogin).returning('*');
  return _toDomain(userLoginDTO);
};

/**
 * @typedef update
 * @type {function}
 * @param {UserLogin} userLogin
 * @return {Promise<UserLogin>}
 */
const update = async function (userLogin) {
  userLogin.updatedAt = new Date();
  const [userLoginDTO] = await knex(USER_LOGINS_TABLE_NAME)
    .where({ id: userLogin.id })
    .update(userLogin)
    .returning('*');
  return _toDomain(userLoginDTO);
};

/**
 * @typedef findByUsername
 * @type {function}
 * @param {string} username
 * @return {Promise<UserLogin|null>}
 */
const findByUsername = async function (username) {
  const userLoginDTO = await knex
    .select('user-logins.*')
    .from(USER_LOGINS_TABLE_NAME)
    .where('users.email', username.toLowerCase())
    .orWhere('users.username', username.toLowerCase())
    .join('users', 'users.id', 'user-logins.userId')
    .first();

  return userLoginDTO ? _toDomain(userLoginDTO) : null;
};

/**
 * @typedef updateLastLoggedAt
 * @type {function}
 * @param {string|number} userId
 * @return {Promise<void>}
 */
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

/**
 * @typedef UserLoginRepository
 * @type {object}
 * @property {create} create
 * @property {findByUserId} findByUserId
 * @property {findByUsername} findByUsername
 * @property {update} update
 * @property {updateLastLoggedAt} updateLastLoggedAt
 */
export { create, findByUserId, findByUsername, getByUserId, update, updateLastLoggedAt };
