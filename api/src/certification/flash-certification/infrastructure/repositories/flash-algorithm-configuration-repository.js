import { knex } from '../../../../../db/knex-database-connection.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';

const TABLE_NAME = 'flash-algorithm-configurations';

const save = async function (flashAlgorithmConfiguration) {
  return knex(TABLE_NAME).insert(flashAlgorithmConfiguration.toDTO());
};

const get = async function () {
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

export { save, get, getMostRecentBeforeDate };
