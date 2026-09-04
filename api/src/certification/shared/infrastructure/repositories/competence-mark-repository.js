import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CompetenceMark } from '../../domain/models/CompetenceMark.js';

export async function save(competenceMark) {
  await competenceMark.validate();
  const knexConn = DomainTransaction.getConnection();
  const [savedCompetenceMark] = await knexConn('competence-marks')
    .insert(competenceMark)
    .onConflict('id')
    .merge()
    .returning('*');

  return new CompetenceMark(savedCompetenceMark);
}

/**
 * @param {object} params
 * @param {CompetenceMark[]} params.competenceMarks
 * @returns {Promise<void>}
 */
export async function saveMany({ competenceMarks }) {
  await Promise.all(competenceMarks.map((competenceMark) => competenceMark.validate()));

  const knexConn = DomainTransaction.getConnection();
  await knexConn('competence-marks').insert(competenceMarks).returning('*');
}
