import { knex } from '../../../db/knex-database-connection';
import BadgeCriterion from '../../../lib/domain/models/BadgeCriterion';
import DomainTransaction from '../../infrastructure/DomainTransaction';

const TABLE_NAME = 'badge-criteria';

export default {
  async save({ badgeCriterion }, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const data = {
      ...badgeCriterion,
      // WORKAROUND: jsonb array needs to be stringified see https://knexjs.org/guide/schema-builder.html#json
      cappedTubes: badgeCriterion.cappedTubes ? JSON.stringify(badgeCriterion.cappedTubes) : null,
    };
    const savedBadgeCriterion = await (knexTransaction ?? knex)(TABLE_NAME).insert(data).returning('*');
    return new BadgeCriterion(savedBadgeCriterion[0]);
  },
};
