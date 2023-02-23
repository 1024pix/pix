const BookshelfCompetenceMark = require('../orm-models/CompetenceMark.js');
const CompetenceMark = require('../../domain/models/CompetenceMark.js');
const { knex } = require('../../../db/knex-database-connection.js');
const DomainTransaction = require('../DomainTransaction.js');

function _toDomain(competenceMark) {
  return new CompetenceMark(competenceMark);
}

module.exports = {
  async save(competenceMark, domainTransaction = DomainTransaction.emptyTransaction()) {
    await competenceMark.validate();
    const savedCompetenceMark = await new BookshelfCompetenceMark(competenceMark).save(null, {
      transacting: domainTransaction.knexTransaction,
    });
    return savedCompetenceMark.toDomainEntity();
  },

  async findByAssessmentResultId(assessmentResultId) {
    const competenceMarks = await BookshelfCompetenceMark.where({ assessmentResultId }).fetchAll();
    return competenceMarks.models.map((model) => _toDomain(model.attributes));
  },

  async findByCertificationCourseId(certificationCourseId) {
    const competenceMarks = await knex
      .select(
        'competence-marks.id',
        'competence-marks.area_code',
        'competence-marks.competence_code',
        'competence-marks.competenceId',
        'competence-marks.level',
        'competence-marks.score',
        'competence-marks.assessmentResultId'
      )
      .from('assessments')
      .join('assessment-results', 'assessments.id', 'assessment-results.assessmentId')
      .leftJoin({ 'latest-assessment-results': 'assessment-results' }, function () {
        this.on('assessments.id', 'latest-assessment-results.assessmentId').andOn(
          'assessment-results.createdAt',
          '<',
          'latest-assessment-results.createdAt'
        );
      })
      .join('competence-marks', 'assessment-results.id', 'competence-marks.assessmentResultId')
      .whereNull('latest-assessment-results.id')
      .where('assessments.certificationCourseId', certificationCourseId)
      .orderBy('competence-marks.id');

    return competenceMarks.map(_toDomain);
  },
};
