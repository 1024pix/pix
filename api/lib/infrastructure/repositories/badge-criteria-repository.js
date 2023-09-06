import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';

const TABLE_NAME = 'badge-criteria';

const save = async function ({ badgeCriterion }, { knexTransaction } = DomainTransaction.emptyTransaction()) {
  const data = {
    ...badgeCriterion,
    // WORKAROUND: jsonb array needs to be stringified see https://knexjs.org/guide/schema-builder.html#json
    cappedTubes: badgeCriterion.cappedTubes ? JSON.stringify(badgeCriterion.cappedTubes) : null,
  };
  await (knexTransaction ?? knex)(TABLE_NAME).insert(data);
};

export { save };
