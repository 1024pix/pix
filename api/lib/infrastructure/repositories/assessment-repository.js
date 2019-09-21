const BookshelfAssessment = require('../data/assessment');
const Assessment = require('../../domain/models/Assessment');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { groupBy, map, head, _ } = require('lodash');
const { NotFoundError } = require('../../domain/errors');

module.exports = {

  get(id) {
    return BookshelfAssessment
      .where('id', id)
      .fetch({
        withRelated: [
          {
            answers: function(query) {
              query.orderBy('createdAt', 'ASC');
            },
          }, 'assessmentResults', 'campaignParticipation', 'campaignParticipation.campaign',
        ],
      })
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment));
  },

  findLastCompletedAssessmentsForEachCoursesByUser(userId, limitDate) {
    return BookshelfAssessment
      .collection()
      .query((qb) => {
        qb.where({ userId })
          .where(function() {
            this.where({ type: 'PLACEMENT' });
          })
          .where('createdAt', '<', limitDate)
          .where('state', '=', 'completed')
          .orderBy('createdAt', 'desc');
      })
      .fetch({
        withRelated: [
          { assessmentResults: (qb) => { qb.where('createdAt', '<', limitDate); } },
        ],
      })
      .then((bookshelfAssessmentCollection) => bookshelfAssessmentCollection.models)
      .then(_selectAssessmentsHavingAnAssessmentResult)
      .then(_selectLastAssessmentForEachCourse)
      .then((assessments) => bookshelfToDomainConverter.buildDomainObjects(BookshelfAssessment, assessments));
  },

  getByAssessmentIdAndUserId(assessmentId, userId) {
    return BookshelfAssessment
      .query({ where: { id: assessmentId }, andWhere: { userId } })
      .fetch({ require: true })
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment))
      .catch((error) => {
        if (error instanceof BookshelfAssessment.NotFoundError) {
          throw new NotFoundError();
        }

        throw error;
      });
  },

  save(assessment) {
    return assessment.validate()
      .then(() => new BookshelfAssessment(_adaptModelToDb(assessment)))
      .then((bookshelfAssessment) => bookshelfAssessment.save())
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment));
  },

  getByCertificationCourseId(certificationCourseId) {
    return BookshelfAssessment
      .where({ courseId: certificationCourseId, type: 'CERTIFICATION' })
      .fetch({ withRelated: ['assessmentResults'] })
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment));
  },

  getByUserIdAndCertificationCourseId(userId, certificationCourseId) {
    return BookshelfAssessment
      .where({ userId, courseId: certificationCourseId, type: 'CERTIFICATION' })
      .fetch({ withRelated: ['assessmentResults', 'answers'] })
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment));
  },

  getByCampaignParticipationId(campaignParticipationId) {
    return BookshelfAssessment
      .where({ 'campaign-participations.id': campaignParticipationId, 'assessments.type': 'SMART_PLACEMENT' })
      .query((qb) => {
        qb.innerJoin('campaign-participations', 'campaign-participations.assessmentId', 'assessments.id');
      })
      .fetch({ require: true, withRelated: ['campaignParticipation.campaign'] })
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment));
  },

  findNotAbortedSmartPlacementAssessmentsByUserId(userId) {
    return BookshelfAssessment
      .where({ userId, type: 'SMART_PLACEMENT' })
      .where('state', '!=', 'aborted')
      .fetchAll()
      .then((assessments) => bookshelfToDomainConverter.buildDomainObjects(BookshelfAssessment, assessments));
  },

  getLastSmartPlacementAssessmentByUserIdAndCampaignCode({ userId, campaignCode, includeCampaign = false }) {
    return BookshelfAssessment
      .where({ 'assessments.userId': userId, 'assessments.type': 'SMART_PLACEMENT', 'campaigns.code': campaignCode })
      .query((qb) => {
        qb.innerJoin('campaign-participations', 'campaign-participations.assessmentId', 'assessments.id');
        qb.innerJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id');
      })
      .orderBy('createdAt', 'desc')
      .fetch({ required: false, withRelated: includeCampaign ? ['campaignParticipation', 'campaignParticipation.campaign'] : [] })
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment));
  },

  // TODO: maybe obsolete after v1 be finished
  hasCampaignOrCompetenceEvaluation(userId) {
    return BookshelfAssessment
      .where({ userId })
      .where('type', 'IN', ['SMART_PLACEMENT', 'COMPETENCE_EVALUATION'])
      .fetchAll()
      .then((bookshelfAssessmentCollection) => bookshelfAssessmentCollection.length > 0);
  },

  completeByAssessmentId(assessmentId) {
    return this.updateStateById({ id: assessmentId, state: Assessment.states.COMPLETED });
  },

  updateStateById({ id, state }) {
    return BookshelfAssessment
      .where({ id })
      .save({ state }, { require: true, patch: true })
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment));
  }
};

function _selectLastAssessmentForEachCourse(bookshelfAssessments) {
  const assessmentsGroupedByCourse = groupBy(bookshelfAssessments,
    (bookshelfAssessment) => bookshelfAssessment.get('courseId'));
  return map(assessmentsGroupedByCourse, head);
}

function _selectAssessmentsHavingAnAssessmentResult(bookshelfAssessments) {
  return bookshelfAssessments.filter((bookshelfAssessment) => bookshelfAssessment.relations.assessmentResults.length > 0);
}

function _adaptModelToDb(assessment) {
  return _.omit(assessment, [
    'id',
    'course',
    'createdAt',
    'updatedAt',
    'successRate',
    'answers',
    'assessmentResults',
    'targetProfile',
    'campaign',
    'campaignParticipation',
    'title',
  ]);
}
