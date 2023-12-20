import { CompetenceMark } from '../../domain/models/CompetenceMark.js';
import { knex } from '../../../db/knex-database-connection.js';
import { DomainTransaction } from '../DomainTransaction.js';

function _toDomain(competenceMark) {
  return new CompetenceMark(competenceMark);
}

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

const findByCertificationCourseId = async function (certificationCourseId) {
  const competenceMarks = await knex
    .select(
      'competence-marks.id',
      'competence-marks.area_code',
      'competence-marks.competence_code',
      'competence-marks.competenceId',
      'competence-marks.level',
      'competence-marks.score',
      'competence-marks.assessmentResultId',
    )
    .from('assessments')
    .join('assessment-results', 'assessments.id', 'assessment-results.assessmentId')
    .leftJoin({ 'latest-assessment-results': 'assessment-results' }, function () {
      this.on('assessments.id', 'latest-assessment-results.assessmentId').andOn(
        'assessment-results.createdAt',
        '<',
        'latest-assessment-results.createdAt',
      );
    })
    .join('competence-marks', 'assessment-results.id', 'competence-marks.assessmentResultId')
    .whereNull('latest-assessment-results.id')
    .where('assessments.certificationCourseId', certificationCourseId)
    .orderBy('competence-marks.id');

  return competenceMarks.map(_toDomain);
};

export { save, findByCertificationCourseId };
