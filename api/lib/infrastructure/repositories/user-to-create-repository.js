const { knex } = require('../../../db/knex-database-connection');

const DomainTransaction = require('../DomainTransaction');

const { AlreadyRegisteredUsernameError } = require('../../domain/errors');

const User = require('../../domain/models/User');

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
  const result = await knexConnection(
    knex.raw('?? (??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??, ??)', ['users', ...Object.keys(user)])
  )
    .insert(
      knex.select(knex.raw('?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?', Object.values(user)))
      //.whereNotExists(knex('users').where({ username: user.username }))
    )
    .returning('*');

  if (result.length < 1) {
    throw new AlreadyRegisteredUsernameError();
  }
  return _toUserDomain(result[0]);
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
