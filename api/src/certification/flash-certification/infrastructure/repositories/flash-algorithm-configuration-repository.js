import { knex } from '../../../../../db/knex-database-connection.js';

const TABLE_NAME = 'flash-algorithm-configurations';

const save = async function (flashAlgorithmConfiguration) {
  const data = {
    ...flashAlgorithmConfiguration,
    forcedCompetences: JSON.stringify(flashAlgorithmConfiguration.forcedCompetences),
    minimumEstimatedSuccessRateRanges: JSON.stringify(flashAlgorithmConfiguration.minimumEstimatedSuccessRateRanges),
  };
  return knex(TABLE_NAME).insert(data);
};

export { save };
