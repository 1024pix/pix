import { knex } from '../../../db/knex-database-connection';
import DomainTransaction from '../../infrastructure/DomainTransaction';
import SkillSet from '../../../lib/domain/models/SkillSet';

const TABLE_NAME = 'skill-sets';

export default {
  async save({ skillSet }, { knexTransaction } = DomainTransaction.emptyTransaction()) {
    const savedSkillSet = await (knexTransaction ?? knex)(TABLE_NAME).insert(skillSet).returning('*');
    return new SkillSet(savedSkillSet[0]);
  },
};
