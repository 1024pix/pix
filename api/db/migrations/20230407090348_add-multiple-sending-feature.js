const TABLE_NAME = 'features';
import { ORGANIZATION_FEATURE } from '../../lib/domain/constants.js';

const up = function (knex) {
  return knex(TABLE_NAME).insert({
    key: ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key,
    description: ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.description,
  });
};

const down = function (knex) {
  return knex(TABLE_NAME).where({ key: ORGANIZATION_FEATURE.MULTIPLE_SENDING_ASSESSMENT.key }).delete();
};

export { up, down };
