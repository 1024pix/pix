const { knex } = require('../../../db/knex-database-connection.js');

const DomainTransaction = require('../DomainTransaction.js');

const { OrganizationLearnerAlreadyLinkedToUserError } = require('../../domain/errors.js');
const { STUDENT_RECONCILIATION_ERRORS } = require('../../domain/constants.js');

const User = require('../../domain/models/User.js');
const { PGSQL_UNIQUE_CONSTRAINT_VIOLATION_ERROR } = require('../../../db/pgsql-errors.js');

module.exports = {
  async create({ user, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConnection = domainTransaction.knexTransaction || knex;

    if (user.username) {
      return await _createWithUsername({ knexConnection, user });
    } else {
      return await _createWithoutUsername({ knexConnection, user });
    }
  },
};

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

async function _createWithoutUsername({ knexConnection, user }) {
  const result = await knexConnection('users').insert(user).returning('*');
  return _toUserDomain(result[0]);
}

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
    isAnonymous: Boolean(userDTO.isAnonymous),
    lastTermsOfServiceValidatedAt: userDTO.lastTermsOfServiceValidatedAt,
    hasSeenNewDashboardInfo: Boolean(userDTO.hasSeenNewDashboardInfo),
    mustValidateTermsOfService: Boolean(userDTO.mustValidateTermsOfService),
    pixOrgaTermsOfServiceAccepted: Boolean(userDTO.pixOrgaTermsOfServiceAccepted),
    pixCertifTermsOfServiceAccepted: Boolean(userDTO.pixCertifTermsOfServiceAccepted),
    hasSeenAssessmentInstructions: Boolean(userDTO.hasSeenAssessmentInstructions),
  });
}
