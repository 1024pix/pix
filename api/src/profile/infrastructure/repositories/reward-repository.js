import { REWARD_TYPES } from '../../../quest/domain/constants.js';
import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { RewardTypeDoesNotExistError } from '../../domain/errors.js';
import { Attestation } from '../../domain/models/Attestation.js';

export const getByIdAndType = async ({ rewardId, rewardType }) => {
  const knexConn = DomainTransaction.getConnection();
  try {
    const result = await knexConn(rewardType).where({ id: rewardId }).first();
    switch (rewardType) {
      case REWARD_TYPES.ATTESTATION:
        return new Attestation(result);
    }
  } catch (error) {
    throw new RewardTypeDoesNotExistError(error);
  }
};
