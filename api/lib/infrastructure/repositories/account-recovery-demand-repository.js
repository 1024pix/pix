const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection.js');
const AccountRecoveryDemand = require('../../domain/models/AccountRecoveryDemand.js');
const { NotFoundError } = require('../../domain/errors.js');
const DomainTransaction = require('../DomainTransaction.js');

const _toDomain = (accountRecoveryDemandDTO) => {
  return new AccountRecoveryDemand(accountRecoveryDemandDTO);
};

const _toDomainArray = (accountRecoveryDemandsDTOs) => {
  return _.map(accountRecoveryDemandsDTOs, _toDomain);
};

module.exports = {
  async findByTemporaryKey(temporaryKey) {
    const accountRecoveryDemandDTO = await knex
      .where({ temporaryKey })
      .select('id', 'organizationLearnerId', 'userId', 'oldEmail', 'newEmail', 'temporaryKey', 'used', 'createdAt')
      .from('account-recovery-demands')
      .first();

    if (!accountRecoveryDemandDTO) {
      throw new NotFoundError('No account recovery demand found');
    }

    return _toDomain(accountRecoveryDemandDTO);
  },

  async findByUserId(userId) {
    const accountRecoveryDemandsDTOs = await knex
      .select('id', 'organizationLearnerId', 'userId', 'oldEmail', 'newEmail', 'temporaryKey', 'used', 'createdAt')
      .from('account-recovery-demands')
      .where({ userId });

    return _toDomainArray(accountRecoveryDemandsDTOs);
  },

  async save(accountRecoveryDemand) {
    const result = await knex('account-recovery-demands').insert(accountRecoveryDemand).returning('*');

    return _toDomain(result[0]);
  },

  async markAsBeingUsed(temporaryKey, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const query = knex('account-recovery-demands')
      .where({ temporaryKey })
      .update({ used: true, updatedAt: knex.fn.now() });
    if (knexTransaction) query.transacting(knexTransaction);
    return query;
  },
};
