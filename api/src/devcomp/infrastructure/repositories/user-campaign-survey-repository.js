import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AlreadyExistingEntityError } from '../../../shared/domain/errors.js';
import { isUniqConstraintViolated } from '../../../shared/infrastructure/utils/knex-utils.js';
import { UserCampaignSurvey } from '../../domain/models/UserCampaignSurvey.js';

const TABLE_NAME = 'user-campaign-surveys';

export async function save(userCampaignSurvey) {
  const knexConn = DomainTransaction.getConnection();
  try {
    const [result] = await knexConn(TABLE_NAME).insert(userCampaignSurvey).returning('id');
    return result.id;
  } catch (error) {
    if (isUniqConstraintViolated(error)) {
      throw new AlreadyExistingEntityError('User has already submitted a survey for this campaign');
    }
    throw error;
  }
}

export async function findByCampaignIdAndUserId({ campaignId, userId }) {
  const knexConn = DomainTransaction.getConnection();
  const userCampaignSurvey = await knexConn(TABLE_NAME).where({ campaignId, userId }).first();

  if (!userCampaignSurvey) {
    return null;
  }

  return _toDomain(userCampaignSurvey);
}

function _toDomain({ campaignId, userId, satisfactionScore } = {}) {
  return new UserCampaignSurvey({ campaignId, userId, satisfactionScore });
}
