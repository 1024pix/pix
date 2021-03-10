const BookshelfAssessment = require('../data/assessment');
const DomainTransaction = require('../DomainTransaction');
const Assessment = require('../../domain/models/Assessment');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { groupBy, map, head, _ } = require('lodash');
const { NotFoundError } = require('../../domain/errors');
const { knex } = require('../bookshelf');

module.exports = {

  getWithAnswersAndCampaignParticipation(id) {
    return BookshelfAssessment
      .where('id', id)
      .fetch({
        withRelated: [
          {
            answers: function(query) {
              query.orderBy('createdAt', 'ASC');
            },
          }, 'campaignParticipation', 'campaignParticipation.campaign',
        ],
      })
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment));
  },

  async get(id) {
    try {
      const bookshelfAssessment = await BookshelfAssessment
        .where({ id })
        .fetch({ require: true });

      return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, bookshelfAssessment);
    } catch (err) {
      if (err instanceof BookshelfAssessment.NotFoundError) {
        throw new NotFoundError('L\'assessment n\'existe pas ou son accès est restreint');
      }
      throw err;
    }
  },

  findLastCompletedAssessmentsForEachCompetenceByUser(userId, limitDate) {
    return BookshelfAssessment
      .collection()
      .query((qb) => {
        qb.join('assessment-results', 'assessment-results.assessmentId', 'assessments.id');
        qb.where({ userId })
          .where(function() {
            this.where({ type: 'PLACEMENT' });
          })
          .where('assessments.createdAt', '<', limitDate)
          .where('assessment-results.createdAt', '<', limitDate)
          .where('assessments.state', '=', 'completed')
          .orderBy('assessments.createdAt', 'desc');
      })
      .fetch()
      .then((bookshelfAssessmentCollection) => bookshelfAssessmentCollection.models)
      .then(_selectLastAssessmentForEachCompetence)
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

  save({ assessment, domainTransaction = DomainTransaction.emptyTransaction() }) {
    return assessment.validate()
      .then(() => new BookshelfAssessment(_adaptModelToDb(assessment)))
      .then((bookshelfAssessment) => bookshelfAssessment.save(null, { transacting: domainTransaction.knexTransaction }))
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment));
  },

  getIdByCertificationCourseId(certificationCourseId) {
    return BookshelfAssessment
      .where({ certificationCourseId, type: Assessment.types.CERTIFICATION })
      .fetch({ columns: 'id' })
      .then((result) => result ? result.attributes.id : null);
  },

  getLatestByCampaignParticipationId(campaignParticipationId) {
    return BookshelfAssessment
      .where({ 'campaign-participations.id': campaignParticipationId, 'assessments.type': 'CAMPAIGN' })
      .query((qb) => {
        qb.innerJoin('campaign-participations', 'campaign-participations.id', 'assessments.campaignParticipationId');
      })
      .orderBy('assessments.createdAt', 'DESC')
      .fetch({ require: true, withRelated: ['campaignParticipation.campaign'] })
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment));
  },

  findNotAbortedCampaignAssessmentsByUserId(userId) {
    return BookshelfAssessment
      .where({ userId, type: 'CAMPAIGN' })
      .where('state', '!=', 'aborted')
      .fetchAll()
      .then((assessments) => bookshelfToDomainConverter.buildDomainObjects(BookshelfAssessment, assessments));
  },

  findLastCampaignAssessmentByUserIdAndCampaignCode({ userId, campaignCode, includeCampaign = false }) {
    return BookshelfAssessment
      .where({ 'assessments.userId': userId, 'assessments.type': 'CAMPAIGN', 'campaigns.code': campaignCode })
      .query((qb) => {
        qb.innerJoin('campaign-participations', 'campaign-participations.id', 'assessments.campaignParticipationId');
        qb.innerJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id');
      })
      .orderBy('createdAt', 'desc')
      .fetch({ required: false, withRelated: includeCampaign ? ['campaignParticipation', 'campaignParticipation.campaign'] : [] })
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment));
  },

  abortByAssessmentId(assessmentId) {
    return this._updateStateById({ id: assessmentId, state: Assessment.states.ABORTED });
  },

  completeByAssessmentId(assessmentId, domainTransaction = DomainTransaction.emptyTransaction()) {
    return this._updateStateById({ id: assessmentId, state: Assessment.states.COMPLETED }, domainTransaction.knexTransaction);
  },

  async ownedByUser({ id, userId = null }) {
    const assessment = await knex('assessments')
      .select('userId')
      .where({ id })
      .first();

    if (!assessment) {
      return false;
    }

    return assessment.userId === userId;
  },

  async _updateStateById({ id, state }, knexTransaction) {
    const assessment = await BookshelfAssessment
      .where({ id })
      .save({ state }, { require: true, patch: true, transacting: knexTransaction });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment);
  },

  async updateLastQuestionDate({ id, lastQuestionDate }) {
    try {
      await BookshelfAssessment
        .where({ id })
        .save({ lastQuestionDate }, { require: true, patch: true, method: 'update' });
    } catch (err) {
      if (err instanceof BookshelfAssessment.NoRowsUpdatedError) {
        return null;
      }
      throw err;
    }
  },
};

function _selectLastAssessmentForEachCompetence(bookshelfAssessments) {
  const assessmentsGroupedByCompetence = groupBy(bookshelfAssessments,
    (bookshelfAssessment) => bookshelfAssessment.get('competenceId'));
  return map(assessmentsGroupedByCompetence, head);
}

function _adaptModelToDb(assessment) {
  return _.omit(assessment, [
    'id',
    'course',
    'createdAt',
    'updatedAt',
    'successRate',
    'answers',
    'targetProfile',
    'campaign',
    'campaignParticipation',
    'title',
  ]);
}
