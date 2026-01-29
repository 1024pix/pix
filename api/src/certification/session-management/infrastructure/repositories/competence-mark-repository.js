import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { CompetenceMark } from '../../../shared/domain/models/CompetenceMark.js';

const findByCertificationCourseId = async function ({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();
  const competenceMarks = await knexConn
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

function _toDomain(competenceMark) {
  return new CompetenceMark(competenceMark);
}

export { findByCertificationCourseId };
