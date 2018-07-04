const BookshelfAssessment = require('../data/assessment');
const Answer = require('../../domain/models/Answer');
const Assessment = require('../../domain/models/Assessment');
const AssessmentResult = require('../../domain/models/AssessmentResult');
const { groupBy, map, head, _ } = require('lodash');

const LIST_NOT_PLACEMENT = ['CERTIFICATION', 'DEMO', 'SMART_PLACEMENT', 'PREVIEW'];

function _selectLastAssessmentForEachCourse(assessments) {
  const assessmentsGroupedByCourse = groupBy(assessments.models, (assessment) => assessment.get('courseId'));
  return map(assessmentsGroupedByCourse, head);
}

function _selectAssessmentFinishedBeforeDate(assessments, limitDate) {
  return assessments.filter(assessment => assessment.assessmentResults[0].createdAt < limitDate);
}

function _toDomain(bookshelfAssessment) {
  if (bookshelfAssessment !== null) {
    const modelObjectInJSON = bookshelfAssessment.toJSON();

    const answers = bookshelfAssessment.related('answers')
      .map(bookshelfAnswer => new Answer(bookshelfAnswer.toJSON()));

    const assessmentResults = bookshelfAssessment.related('assessmentResults')
      .map(bookshelfAssessmentResult => new AssessmentResult(bookshelfAssessmentResult.toJSON()));

    return new Assessment(Object.assign(modelObjectInJSON, { answers, assessmentResults }));
  }

  return null;
}

function _adaptModelToDb(assessment) {
  return _.omit(assessment, [
    'course',
    'createdAt',
    'successRate',
    'answers',
    'assessmentResults',
    'targetProfile',
  ]);
}

module.exports = {

  get(id) {
    return BookshelfAssessment
      .where('id', id)
      .fetch({
        withRelated: [{
          answers: function(query) {
            query.orderBy('createdAt', 'ASC');
          },
        }, 'assessmentResults'],
      })
      .then(_toDomain);
  },

  findCompletedAssessmentsByUserId(userId) {
    return BookshelfAssessment
      .query(qb => {
        qb.where({ userId });
        qb.where('state', '=', 'completed');
        qb.andWhere(function() {
          this.where({ type: null })
            .orWhereNotIn('type', LIST_NOT_PLACEMENT);
        });
      })
      .fetchAll({ withRelated: ['assessmentResults'] })
      .then(assessments => assessments.models)
      .then((assessments) => _.map(assessments, (assessment) => _toDomain(assessment)));
  },

  findLastAssessmentsForEachCoursesByUser(userId) {

    return BookshelfAssessment
      .collection()
      .query(qb => {
        qb.select()
          .where({ userId })
          .andWhere(function() {
            this.where({ type: null })
              .orWhereNotIn('type', LIST_NOT_PLACEMENT);
          })
          .orderBy('createdAt', 'desc');
      })
      .fetch({ withRelated: ['assessmentResults'] })
      .then(_selectLastAssessmentForEachCourse)
      .then((assessments) => _.map(assessments, (assessment) => _toDomain(assessment)));
  },

  findLastCompletedAssessmentsForEachCoursesByUser(userId, limitDate) {
    return BookshelfAssessment
      .collection()
      .query(qb => {
        qb.where({ userId })
          .where('createdAt', '<', limitDate)
          .where('state', '=', 'completed')
          .andWhere(function() {
            this.where({ type: null })
              .orWhereNotIn('type', LIST_NOT_PLACEMENT);
          })
          .orderBy('createdAt', 'desc');
      })
      .fetch({ withRelated: ['assessmentResults'] })
      .then(_selectLastAssessmentForEachCourse)
      .then((assessments) => _.map(assessments, (assessment) => _toDomain(assessment)))
      .then(assessments => _selectAssessmentFinishedBeforeDate(assessments, limitDate));
  },

  getByUserIdAndAssessmentId(assessmentId, userId) {
    return BookshelfAssessment
      .query({ where: { id: assessmentId }, andWhere: { userId } })
      .fetch({ require: true })
      .then(_toDomain);
  },

  save(assessment) {
    return assessment.validate()
      .then(() => new BookshelfAssessment(_adaptModelToDb(assessment)))
      .then((assessmentBookshelf) => assessmentBookshelf.save())
      .then(_toDomain);
  },

  getByCertificationCourseId(certificationCourseId) {
    return BookshelfAssessment
      .where({ courseId: certificationCourseId })
      .fetch({ withRelated: ['assessmentResults'] })
      .then(_toDomain);
  },

  findByFilters(filters) {
    return BookshelfAssessment
      .where(filters)
      .fetchAll()
      .then(assessments => assessments.models)
      .then((assessments) => _.map(assessments, (assessment) => _toDomain(assessment)));
  },

};
