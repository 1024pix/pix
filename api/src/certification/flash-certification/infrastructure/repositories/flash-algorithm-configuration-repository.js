import { knex } from '../../../../../db/knex-database-connection.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../domain/model/FlashAssessmentAlgorithmConfiguration.js';

const TABLE_NAME = 'flash-algorithm-configurations';

const save = async function (flashAlgorithmConfiguration) {
  const data = {
    ...flashAlgorithmConfiguration,
    forcedCompetences: JSON.stringify(flashAlgorithmConfiguration.forcedCompetences),
    minimumEstimatedSuccessRateRanges: JSON.stringify(flashAlgorithmConfiguration.minimumEstimatedSuccessRateRanges),
  };
  return knex(TABLE_NAME).insert(data);
};

const get = async function () {
  const flashAlgorithmConfiguration = await knex(TABLE_NAME).first();

  if (!flashAlgorithmConfiguration) {
    return null;
  }

  return new FlashAssessmentAlgorithmConfiguration(flashAlgorithmConfiguration);
};

export { save, get };
