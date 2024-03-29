import { knex } from '../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';
import BadgeCriterion from '../../domain/models/BadgeCriterion.js';

const TABLE_NAME = 'badge-criteria';

const save = async function ({ badgeCriterion }, { knexTransaction } = DomainTransaction.emptyTransaction()) {
  const data = {
    ...badgeCriterion,
    // WORKAROUND: jsonb array needs to be stringified see https://knexjs.org/guide/schema-builder.html#json
    cappedTubes: badgeCriterion.cappedTubes ? JSON.stringify(badgeCriterion.cappedTubes) : null,
  };
  await (knexTransaction ?? knex)(TABLE_NAME).insert(data);
};

const updateCriterion = async function (criterion) {
  const [updatedCriterion] = await knex(TABLE_NAME)
    .update(criterion)
    .where({
      id: criterion.id,
    })
    .returning('*');

  return new BadgeCriterion({ ...criterion, ...updatedCriterion });
};

export { save, updateCriterion };
