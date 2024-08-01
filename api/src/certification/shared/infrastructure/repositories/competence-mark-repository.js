import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CompetenceMark } from '../../domain/models/CompetenceMark.js';

const save = async function (competenceMark) {
  await competenceMark.validate();
  const knexConn = DomainTransaction.getConnection();
  const [savedCompetenceMark] = await knexConn('competence-marks')
    .insert(competenceMark)
    .onConflict('id')
    .merge()
    .returning('*');

  return new CompetenceMark(savedCompetenceMark);
};

export { save };
