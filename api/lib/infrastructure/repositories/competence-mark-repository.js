const BookshelfCompetenceMark = require('../data/competence-mark');
const CompetenceMark = require('../../domain/models/CompetenceMark');
const { knex } = require('../bookshelf');
const DomainTransaction = require('../DomainTransaction');

function _toDomain(competenceMark) {
  return new CompetenceMark(competenceMark);
}

module.exports = {
  async save(competenceMark, domainTransaction = DomainTransaction.emptyTransaction()) {
    const transacting = domainTransaction && domainTransaction.knexTransaction;
    await competenceMark.validate();
    const savedCompetenceMark = await new BookshelfCompetenceMark(competenceMark)
      .save(null, { transacting });
    return savedCompetenceMark.toDomainEntity();
  },

  async findByAssessmentResultId(assessmentResultId) {
    const competenceMarks = await BookshelfCompetenceMark
      .where({ assessmentResultId })
      .fetchAll();
    return competenceMarks.models.map((model) =>_toDomain(model.attributes));
  },

  async findByCertificationCourseId(certificationCourseId) {
    const competenceMarks = await knex('competence-marks')
      .select(
        'competence-marks.id',
        'area_code',
        'competence_code',
        'competence-marks.competenceId',
        'competence-marks.level',
        'competence-marks.score',
        'competence-marks.assessmentResultId',
      )
      .join('assessment-results', 'assessmentResultId', 'assessment-results.id')
      .join('assessments', 'assessmentId', 'assessments.id')
      .where({ certificationCourseId });

    return competenceMarks.map(_toDomain);
  },
};
