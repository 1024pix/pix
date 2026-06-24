import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { AlreadyExistingEntityError } from '../../../shared/domain/errors.js';
import { isUniqConstraintViolated } from '../../../shared/infrastructure/utils/knex-utils.js';

export async function save(userCampaignSurvey) {
  const knexConn = DomainTransaction.getConnection();
  try {
    const [result] = await knexConn('user-campaign-surveys').insert(userCampaignSurvey).returning('id');
    return result.id;
  } catch (error) {
    if (isUniqConstraintViolated(error)) {
      throw new AlreadyExistingEntityError('User has already submitted a survey for this campaign');
    }
    throw error;
  }
}
