import { knex } from '../../../db/knex-database-connection.js';
import { BadgeCriterion } from '../../../lib/domain/models/BadgeCriterion.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';

const TABLE_NAME = 'badge-criteria';

const save = async function ({ badgeCriterion }, { knexTransaction } = DomainTransaction.emptyTransaction()) {
  const data = {
    ...badgeCriterion,
    // WORKAROUND: jsonb array needs to be stringified see https://knexjs.org/guide/schema-builder.html#json
    cappedTubes: badgeCriterion.cappedTubes ? JSON.stringify(badgeCriterion.cappedTubes) : null,
  };
  const savedBadgeCriterion = await (knexTransaction ?? knex)(TABLE_NAME).insert(data).returning('*');
  return new BadgeCriterion(savedBadgeCriterion[0]);
};

export { save };
