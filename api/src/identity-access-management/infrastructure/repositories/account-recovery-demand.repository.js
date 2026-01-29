import _ from 'lodash';

import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../shared/domain/errors.js';
import { AccountRecoveryDemand } from '../../domain/models/AccountRecoveryDemand.js';

const _toDomain = (accountRecoveryDemandDTO) => {
  return new AccountRecoveryDemand(accountRecoveryDemandDTO);
};

const _toDomainArray = (accountRecoveryDemandsDTOs) => {
  return _.map(accountRecoveryDemandsDTOs, _toDomain);
};

const findByTemporaryKey = async function (temporaryKey) {
  const knexConn = DomainTransaction.getConnection();
  const accountRecoveryDemandDTO = await knexConn
    .where({ temporaryKey })
    .select('id', 'organizationLearnerId', 'userId', 'oldEmail', 'newEmail', 'temporaryKey', 'used', 'createdAt')
    .from('account-recovery-demands')
    .first();

  if (!accountRecoveryDemandDTO) {
    throw new NotFoundError('No account recovery demand found');
  }

  return _toDomain(accountRecoveryDemandDTO);
};

const findByUserId = async function (userId) {
  const knexConn = DomainTransaction.getConnection();
  const accountRecoveryDemandsDTOs = await knexConn
    .select('id', 'organizationLearnerId', 'userId', 'oldEmail', 'newEmail', 'temporaryKey', 'used', 'createdAt')
    .from('account-recovery-demands')
    .where({ userId });

  return _toDomainArray(accountRecoveryDemandsDTOs);
};

const save = async function (accountRecoveryDemand) {
  const knexConn = DomainTransaction.getConnection();
  const result = await knexConn('account-recovery-demands').insert(accountRecoveryDemand).returning('*');

  return _toDomain(result[0]);
};

const markAsBeingUsed = async function (temporaryKey) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('account-recovery-demands')
    .where({ temporaryKey })
    .update({ used: true, updatedAt: knexConn.fn.now() });
};

export const accountRecoveryDemandRepository = { findByTemporaryKey, findByUserId, markAsBeingUsed, save };
