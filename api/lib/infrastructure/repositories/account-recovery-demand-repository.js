const { knex } = require('../../../db/knex-database-connection');
const AccountRecoveryDemand = require('../../domain/models/AccountRecoveryDemand');
const {
  NotFoundError,
  AccountRecoveryDemandExpired,
} = require('../../domain/errors');

function _toDomainObject(accountRecoveryDemandDTO) {
  return new AccountRecoveryDemand({
    ...accountRecoveryDemandDTO,
  });
}

module.exports = {

  async findByTemporaryKey(temporaryKey) {

    const accountRecoveryDemandDTO = await knex
      .where({ temporaryKey, used: false })
      .select('id', 'userId', 'oldEmail', 'newEmail', 'temporaryKey', 'used', 'createdAt')
      .from('account-recovery-demands')
      .first();

    if (!accountRecoveryDemandDTO) {
      throw new NotFoundError('No account recovery demand found');
    }

    const dateLimitBeforeExpiration = new Date();
    const numberOfDayBeforeExpiration = 1;
    dateLimitBeforeExpiration.setDate(dateLimitBeforeExpiration.getDate() - numberOfDayBeforeExpiration);

    if (accountRecoveryDemandDTO.createdAt <= dateLimitBeforeExpiration) {
      throw new AccountRecoveryDemandExpired();
    }

    return _toDomainObject(accountRecoveryDemandDTO);
  },

  async save(accountRecoveryDemand) {
    const result = await knex('account-recovery-demands')
      .insert(accountRecoveryDemand)
      .returning('*');

    return _toDomainObject(result[0]);
  },

};
