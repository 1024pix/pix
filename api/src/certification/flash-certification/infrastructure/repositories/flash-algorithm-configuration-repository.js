import { knex } from '../../../../../db/knex-database-connection.js';
import { FlashAssessmentAlgorithmConfiguration } from '../../domain/models/FlashAssessmentAlgorithmConfiguration.js';

const TABLE_NAME = 'flash-algorithm-configurations';

const save = async function (flashAlgorithmConfiguration) {
  return knex(TABLE_NAME).insert(flashAlgorithmConfiguration.toDTO());
};

const get = async function () {
  const flashAlgorithmConfiguration = await knex(TABLE_NAME).first();

  if (!flashAlgorithmConfiguration) {
    return new FlashAssessmentAlgorithmConfiguration();
  }

  return FlashAssessmentAlgorithmConfiguration.fromDTO(flashAlgorithmConfiguration);
};

export { save, get };
