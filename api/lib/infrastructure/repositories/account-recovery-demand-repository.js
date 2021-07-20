const { knex } = require('../../../db/knex-database-connection');
const AccountRecoveryDemand = require('../../domain/models/AccountRecoveryDemand');
const {
  NotFoundError,
  TooManyRows,
  AccountRecoveryDemandExpired,
} = require('../../domain/errors');
const { isEmpty } = require('lodash');

function _toDomainObject(accountRecoveryDemandDTO) {
  return new AccountRecoveryDemand({
    ...accountRecoveryDemandDTO,
  });
}

module.exports = {

  async findByTemporaryKey(temporaryKey) {

    const accountRecoveryDemandDTOs = await knex
      .where({ temporaryKey, used: false })
      .select('id', 'userId', 'oldEmail', 'newEmail', 'temporaryKey', 'used', 'createdAt')
      .from('account-recovery-demands');

    if (isEmpty(accountRecoveryDemandDTOs)) {
      throw new NotFoundError('No account recovery demand found');
    }

    if (accountRecoveryDemandDTOs.length > 1) {
      throw new TooManyRows('Multiple demands found for the same temporary key');
    }

    const accountRecoveryDemand = accountRecoveryDemandDTOs[0];
    const dateLimitBeforeExpiration = new Date();
    const numberOfDayBeforeExpiration = 1;
    dateLimitBeforeExpiration.setDate(dateLimitBeforeExpiration.getDate() - numberOfDayBeforeExpiration);

    if (accountRecoveryDemand.createdAt <= dateLimitBeforeExpiration) {
      throw new AccountRecoveryDemandExpired();
    }

    return _toDomainObject(accountRecoveryDemand);
  },

  async save(accountRecoveryDemand) {
    const result = await knex('account-recovery-demands')
      .insert(accountRecoveryDemand)
      .returning('*');

    return _toDomainObject(result[0]);
  },

  async markAsBeingUsed(temporaryKey) {
    return await knex('account-recovery-demands')
      .where({ temporaryKey })
      .update({ used: true });
  },

};
