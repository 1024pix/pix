import { knex } from '../../../../db/knex-database-connection.js';
import { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } from '../../../../db/pgsql-errors.js';
import { STUDENT_RECONCILIATION_ERRORS } from '../../../../lib/domain/constants.js';
import { OrganizationLearnerAlreadyLinkedToUserError } from '../../../../lib/domain/errors.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import { User } from '../../domain/models/User.js';

/**
 * @param {Object} data
 * @property user
 * @property domainTransaction
 * @return {Promise<User|OrganizationLearnerAlreadyLinkedToUserError>}
 */
const create = async function ({ user, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConnection = domainTransaction.knexTransaction || knex;

  if (user.username) {
    return await _createWithUsername({ knexConnection, user });
  } else {
    return await _createWithoutUsername({ knexConnection, user });
  }
};

/**
 * @typedef {Object} UserToCreateRepository
 * @property {function} create
 */
export const userToCreateRepository = { create };

/**
 * @param {Object} data
 * @property knexConnection
 * @property user
 * @return {Promise<User|OrganizationLearnerAlreadyLinkedToUserError>}
 * @private
 */
async function _createWithUsername({ knexConnection, user }) {
  const detail = 'Un compte avec cet identifiant existe déjà.';
  const error = STUDENT_RECONCILIATION_ERRORS.LOGIN_OR_REGISTER.IN_DB.username;
  const meta = { shortCode: error.shortCode, value: user.userName };

  try {
    const result = await knexConnection('users').insert(user).returning('*');
    return _toUserDomain(result[0]);
  } catch (error) {
    if (error.constraint === 'users_username_unique' && error.code === PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR) {
      throw new OrganizationLearnerAlreadyLinkedToUserError(detail, error.code, meta);
    }
  }
}

/**
 * @param {Object} data
 * @property knexConnection
 * @property user
 * @return {Promise<User>}
 * @private
 */
async function _createWithoutUsername({ knexConnection, user }) {
  const result = await knexConnection('users').insert(user).returning('*');
  return _toUserDomain(result[0]);
}

/**
 * @param {Object} userDTO
 * @return {User}
 * @private
 */
function _toUserDomain(userDTO) {
  return new User({
    id: userDTO.id,
    firstName: userDTO.firstName,
    lastName: userDTO.lastName,
    email: userDTO.email,
    emailConfirmedAt: userDTO.emailConfirmedAt,
    username: userDTO.username,
    password: userDTO.password,
    shouldChangePassword: Boolean(userDTO.shouldChangePassword),
    cgu: Boolean(userDTO.cgu),
    lang: userDTO.lang,
    locale: userDTO.locale,
    isAnonymous: Boolean(userDTO.isAnonymous),
    lastTermsOfServiceValidatedAt: userDTO.lastTermsOfServiceValidatedAt,
    hasSeenNewDashboardInfo: Boolean(userDTO.hasSeenNewDashboardInfo),
    mustValidateTermsOfService: Boolean(userDTO.mustValidateTermsOfService),
    pixOrgaTermsOfServiceAccepted: Boolean(userDTO.pixOrgaTermsOfServiceAccepted),
    pixCertifTermsOfServiceAccepted: Boolean(userDTO.pixCertifTermsOfServiceAccepted),
    hasSeenAssessmentInstructions: Boolean(userDTO.hasSeenAssessmentInstructions),
  });
}
