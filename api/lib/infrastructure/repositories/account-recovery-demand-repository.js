const { knex } = require('../../../db/knex-database-connection');
const AccountRecoveryDemand = require('../../domain/models/AccountRecoveryDemand');
const { NotFoundError, TooManyRows } = require('../../domain/errors');
const { isEmpty, map } = require('lodash');

function _toDomain(accountRecoveryDemandDTO) {
  return new AccountRecoveryDemand({
    ...accountRecoveryDemandDTO,
  });
}

function _toDomainArray(answerDTOs) {
  return map(answerDTOs, _toDomain);
}

module.exports = {

  async findByTemporaryKey(temporaryKey) {

    const accountRecoveryDemandDTOs = await knex
      .where({ temporaryKey, used: false })
      .select('id', 'userId', 'oldEmail', 'newEmail', 'temporaryKey', 'used')
      .from('account-recovery-demands')
      .orderBy('id', 'desc');

    if (isEmpty(accountRecoveryDemandDTOs)) {
      throw new NotFoundError('No account recovery demand found');
    }

    if (accountRecoveryDemandDTOs.length > 1) {
      throw new TooManyRows('Multiple demands found for the same temporary key');
    }

    return _toDomainArray(accountRecoveryDemandDTOs);
  },

};
