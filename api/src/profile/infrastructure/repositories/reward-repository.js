import { knex } from '../../../../db/knex-database-connection.js';
import { REWARD_TYPES } from '../../../quest/domain/constants.js';
import { RewardTypeDoesNotExistError } from '../../domain/errors.js';
import { Attestation } from '../../domain/models/Attestation.js';

export const getByIdAndType = async ({ rewardId, rewardType }) => {
  try {
    const result = await knex(rewardType).where({ id: rewardId }).first();
    switch (rewardType) {
      case REWARD_TYPES.ATTESTATION:
        return new Attestation(result);
    }
  } catch (error) {
    throw new RewardTypeDoesNotExistError(error);
  }
};
