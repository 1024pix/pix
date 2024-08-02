import { knex } from '../../../../../db/knex-database-connection.js';

const TABLE_NAME = 'flash-algorithm-configurations';

/**
 * TODO: move to configuration context in order to remove flash-certification context
 */
const save = async function (flashAlgorithmConfiguration) {
  return knex(TABLE_NAME).insert(flashAlgorithmConfiguration.toDTO());
};

export { save };
