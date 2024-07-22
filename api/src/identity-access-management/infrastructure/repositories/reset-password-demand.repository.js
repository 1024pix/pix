import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { PasswordResetDemandNotFoundError } from '../../domain/errors.js';
import { ResetPasswordDemand as ResetPasswordDemandModel } from '../../domain/models/ResetPasswordDemand.js';

const RESET_PASSWORD_DEMANDS_TABLE_NAME = 'reset-password-demands';

/**
 * @param {Object} values
 * @param {string} values.email
 * @param {string} values.temporaryKey
 *
 * @returns {ResetPasswordDemand} Created reset password demand
 */
const create = async function ({ email, temporaryKey }) {
  const knexConn = DomainTransaction.getConnection();

  const [inserted] = await knexConn(RESET_PASSWORD_DEMANDS_TABLE_NAME).insert({ email, temporaryKey }).returning('*');

  return _toDomain(inserted);
};

/**
 * @param {string} email
 */
const markAsBeingUsed = async function (email) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn(RESET_PASSWORD_DEMANDS_TABLE_NAME)
    .whereRaw('LOWER("email") = LOWER(?)', email)
    .update({ used: true, updatedAt: new Date() });
};

/**
 * @param {string} temporaryKey
 *
 * @returns {ResetPasswordDemand} retrieved reset password demand
 */
const findByTemporaryKey = async function (temporaryKey) {
  const knexConn = DomainTransaction.getConnection();

  const resetPasswordDemand = await knexConn(RESET_PASSWORD_DEMANDS_TABLE_NAME)
    .select('*')
    .where({ temporaryKey, used: false })
    .first();

  if (!resetPasswordDemand) {
    throw new PasswordResetDemandNotFoundError();
  }

  return _toDomain(resetPasswordDemand);
};

/**
 * @param {string} email
 * @param {string} temporaryKey
 *
 * @returns {ResetPasswordDemand} retrieved reset password demand
 */
const findByUserEmail = async function (email, temporaryKey) {
  const knexConn = DomainTransaction.getConnection();

  const resetPasswordDemand = await knexConn(RESET_PASSWORD_DEMANDS_TABLE_NAME)
    .select('*')
    .whereRaw('LOWER("email") = LOWER(?)', email)
    .where({ temporaryKey, used: false })
    .first();

  if (!resetPasswordDemand) {
    throw new PasswordResetDemandNotFoundError();
  }

  return _toDomain(resetPasswordDemand);
};

/**
 * @param {string} email
 */
const removeAllByEmail = async function (email) {
  const knexConn = DomainTransaction.getConnection();

  await knexConn(RESET_PASSWORD_DEMANDS_TABLE_NAME).whereRaw('LOWER("email") = LOWER(?)', email).del();
};

/**
 * @typedef {Object} ResetPasswordDemandRepository
 * @property {function} create
 * @property {function} deleteByUserEmail
 * @property {function} findByTemporaryKey
 * @property {function} findByUserEmail
 * @property {function} markAsBeingUsed
 */
const resetPasswordDemandRepository = {
  create,
  removeAllByEmail,
  findByTemporaryKey,
  findByUserEmail,
  markAsBeingUsed,
};

export { resetPasswordDemandRepository };

function _toDomain(data) {
  return new ResetPasswordDemandModel(data);
}
