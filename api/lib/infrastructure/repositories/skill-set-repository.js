import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import { SkillSet } from '../../../lib/domain/models/SkillSet.js';

const TABLE_NAME = 'skill-sets';

const save = async function ({ skillSet }, { knexTransaction } = DomainTransaction.emptyTransaction()) {
  const savedSkillSet = await (knexTransaction ?? knex)(TABLE_NAME).insert(skillSet).returning('*');
  return new SkillSet(savedSkillSet[0]);
};

export { save };
