import { knex } from '../../../db/knex-database-connection.js';
import { CompetenceMark } from '../../../src/certification/shared/domain/models/CompetenceMark.js';
import { DomainTransaction } from '../DomainTransaction.js';

const save = async function (competenceMark, domainTransaction = DomainTransaction.emptyTransaction()) {
  await competenceMark.validate();
  const knexConn = domainTransaction.knexTransaction || knex;
  const [savedCompetenceMark] = await knexConn('competence-marks')
    .insert(competenceMark)
    .onConflict('id')
    .merge()
    .returning('*');

  return new CompetenceMark(savedCompetenceMark);
};

export { save };
