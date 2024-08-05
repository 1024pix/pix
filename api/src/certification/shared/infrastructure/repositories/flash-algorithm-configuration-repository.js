import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../domain/models/FlashAssessmentAlgorithmConfiguration.js';

const TABLE_NAME = 'flash-algorithm-configurations';

const getMostRecent = async function () {
  const flashAlgorithmConfiguration = await knex(TABLE_NAME).orderBy('createdAt', 'desc').first();

  if (!flashAlgorithmConfiguration) {
    return new FlashAssessmentAlgorithmConfiguration();
  }

  return FlashAssessmentAlgorithmConfiguration.fromDTO(flashAlgorithmConfiguration);
};

const getMostRecentBeforeDate = async (date) => {
  const flashAlgorithmConfiguration = await knex(TABLE_NAME)
    .where('createdAt', '<=', date)
    .orderBy('createdAt', 'desc')
    .first();

  if (flashAlgorithmConfiguration) {
    return FlashAssessmentAlgorithmConfiguration.fromDTO(flashAlgorithmConfiguration);
  }

  const firstFlashAlgoConfiguration = await knex(TABLE_NAME).orderBy('createdAt', 'asc').first();

  if (!firstFlashAlgoConfiguration) {
    throw new NotFoundError('Configuration not found');
  }

  return FlashAssessmentAlgorithmConfiguration.fromDTO(firstFlashAlgoConfiguration);
};

export { getMostRecent, getMostRecentBeforeDate };
