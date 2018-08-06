const BookshelfAssessment = require('../data/assessment');
const Answer = require('../../domain/models/Answer');
const Assessment = require('../../domain/models/Assessment');
const AssessmentResult = require('../../domain/models/AssessmentResult');
const Campaign = require('../../domain/models/Campaign');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');
const { groupBy, map, head, _ } = require('lodash');
const fp = require('lodash/fp');

const LIST_NOT_PLACEMENT = ['CERTIFICATION', 'DEMO', 'SMART_PLACEMENT', 'PREVIEW'];

function _selectLastAssessmentForEachCourse(bookshelfAssessments) {
  const assessmentsGroupedByCourse = groupBy(bookshelfAssessments, (bookshelfAssessment) => bookshelfAssessment.get('courseId'));
  return map(assessmentsGroupedByCourse, head);
}

function _selectAssessmentsHavingAnAssessmentResult(bookshelfAssessments) {
  return bookshelfAssessments.filter((bookshelfAssessment) => bookshelfAssessment.relations.assessmentResults.length > 0);
}

function _toDomain(bookshelfAssessment) {
  if (bookshelfAssessment !== null) {
    const modelObjectInJSON = bookshelfAssessment.toJSON();

    const answers = bookshelfAssessment.related('answers')
      .map((bookshelfAnswer) => new Answer(bookshelfAnswer.toJSON()));

    const assessmentResults = bookshelfAssessment.related('assessmentResults')
      .map((bookshelfAssessmentResult) => new AssessmentResult(bookshelfAssessmentResult.toJSON()));

    let campaignParticipation = null;
    let campaign = null;
    const campaignOfAssessment = bookshelfAssessment.related('campaignParticipation');

    if(_.has(campaignOfAssessment,'attributes.campaignId')) {
      campaign = new Campaign(campaignOfAssessment.related('campaign').toJSON());
      campaignParticipation = new CampaignParticipation({
        campaign,
        assessmentId: bookshelfAssessment.get('id')
      });
    }

    return new Assessment(Object.assign(modelObjectInJSON, {
      answers,
      assessmentResults,
      campaignParticipation,
    }));
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
    'campaign',
    'campaignParticipation',
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
      .query((qb) => {
        qb.where({ userId });
        qb.where('state', '=', 'completed');
        qb.andWhere(function() {
          this.where({ type: null })
            .orWhereNotIn('type', LIST_NOT_PLACEMENT);
        });
      })
      .fetchAll({ withRelated: ['assessmentResults'] })
      .then((bookshelfAssessmentCollection) => bookshelfAssessmentCollection.models)
      .then(fp.map(_toDomain));
  },

  findLastAssessmentsForEachCoursesByUser(userId) {
    return BookshelfAssessment
      .collection()
      .query((qb) => {
        qb.where({ userId })
          .where(function() {
            this.where({ type: null })
              .orWhereNotIn('type', LIST_NOT_PLACEMENT);
          })
          .orderBy('createdAt', 'desc');
      })
      .fetch({ withRelated: ['assessmentResults'] })
      .then((bookshelfAssessmentCollection) => bookshelfAssessmentCollection.models)
      .then(_selectLastAssessmentForEachCourse)
      .then(fp.map(_toDomain));
  },

  findLastCompletedAssessmentsForEachCoursesByUser(userId, limitDate) {
    return BookshelfAssessment
      .collection()
      .query((qb) => {
        qb.where({ userId })
          .where(function() {
            this.where({ type: null })
              .orWhereNotIn('type', LIST_NOT_PLACEMENT);
          })
          .where('createdAt', '<', limitDate)
          .where('state', '=', 'completed')
          .orderBy('createdAt', 'desc');
      })
      .fetch({ withRelated: [
        { assessmentResults: (qb) => { qb.where('createdAt', '<', limitDate); } }
      ] })
      .then((bookshelfAssessmentCollection) => bookshelfAssessmentCollection.models)
      .then(_selectAssessmentsHavingAnAssessmentResult)
      .then(_selectLastAssessmentForEachCourse)
      .then(fp.map(_toDomain));
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
      .then((bookshelfAssessment) => bookshelfAssessment.save())
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
      .fetchAll({ withRelated: ['campaignParticipation', 'campaignParticipation.campaign'] })
      .then((bookshelfAssessmentCollection) => bookshelfAssessmentCollection.models)
      .then(fp.map(_toDomain));
  },

};
