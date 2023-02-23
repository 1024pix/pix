const BookshelfAssessment = require('../orm-models/Assessment.js');
const DomainTransaction = require('../DomainTransaction.js');
const Assessment = require('../../domain/models/Assessment.js');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter.js');
const { groupBy, map, head, uniqBy, omit } = require('lodash');
const { NotFoundError } = require('../../domain/errors.js');
const { knex } = require('../../../db/knex-database-connection.js');

module.exports = {
  async getWithAnswers(id) {
    const [assessment] = await knex('assessments').where('assessments.id', id);
    if (!assessment) {
      throw new NotFoundError(`Assessment not found for ID ${id}`);
    }

    const answers = await knex('answers')
      .select('id', 'challengeId', 'value')
      .where('assessmentId', id)
      .orderBy('createdAt');
    assessment.answers = uniqBy(answers, 'challengeId');
    return new Assessment(assessment);
  },

  async get(id, domainTransaction = DomainTransaction.emptyTransaction()) {
    const knexConn = domainTransaction.knexTransaction || knex;
    const assessment = await knexConn('assessments').where({ id }).first();

    if (!assessment) {
      throw new NotFoundError("L'assessment n'existe pas ou son accès est restreint");
    }
    return new Assessment(assessment);
  },

  findLastCompletedAssessmentsForEachCompetenceByUser(userId, limitDate) {
    return BookshelfAssessment.collection()
      .query((qb) => {
        qb.join('assessment-results', 'assessment-results.assessmentId', 'assessments.id');
        qb.where({ userId })
          .where(function () {
            this.where({ type: 'PLACEMENT' });
          })
          .where('assessments.createdAt', '<', limitDate)
          .where('assessment-results.createdAt', '<', limitDate)
          .where('assessments.state', '=', 'completed')
          .orderBy('assessments.createdAt', 'desc');
      })
      .fetch({ require: false })
      .then((bookshelfAssessmentCollection) => bookshelfAssessmentCollection.models)
      .then(_selectLastAssessmentForEachCompetence)
      .then((assessments) => bookshelfToDomainConverter.buildDomainObjects(BookshelfAssessment, assessments));
  },

  getByAssessmentIdAndUserId(assessmentId, userId) {
    return BookshelfAssessment.query({ where: { id: assessmentId }, andWhere: { userId } })
      .fetch()
      .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment))
      .catch((error) => {
        if (error instanceof BookshelfAssessment.NotFoundError) {
          throw new NotFoundError();
        }

        throw error;
      });
  },

  async save({ assessment, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction.knexTransaction || knex;
    assessment.validate();
    const [assessmentCreated] = await knexConn('assessments').insert(_adaptModelToDb(assessment)).returning('*');
    return new Assessment(assessmentCreated);
  },

  findNotAbortedCampaignAssessmentsByUserId(userId) {
    return BookshelfAssessment.where({ userId, type: 'CAMPAIGN' })
      .where('state', '!=', 'aborted')
      .fetchAll()
      .then((assessments) => bookshelfToDomainConverter.buildDomainObjects(BookshelfAssessment, assessments));
  },

  abortByAssessmentId(assessmentId) {
    return this._updateStateById({ id: assessmentId, state: Assessment.states.ABORTED });
  },

  completeByAssessmentId(assessmentId, domainTransaction = DomainTransaction.emptyTransaction()) {
    return this._updateStateById(
      { id: assessmentId, state: Assessment.states.COMPLETED },
      domainTransaction.knexTransaction
    );
  },

  endBySupervisorByAssessmentId(assessmentId) {
    return this._updateStateById({ id: assessmentId, state: Assessment.states.ENDED_BY_SUPERVISOR });
  },

  async getByCertificationCandidateId(certificationCandidateId) {
    const assessment = await knex('assessments')
      .select('assessments.*')
      .innerJoin('certification-courses', 'certification-courses.id', 'assessments.certificationCourseId')
      .innerJoin('certification-candidates', function () {
        this.on('certification-candidates.userId', 'certification-courses.userId').andOn(
          'certification-candidates.sessionId',
          'certification-courses.sessionId'
        );
      })
      .where({ 'certification-candidates.id': certificationCandidateId })
      .first();
    return new Assessment({ ...assessment });
  },

  async ownedByUser({ id, userId = null }) {
    const assessment = await knex('assessments').select('userId').where({ id }).first();

    if (!assessment) {
      return false;
    }

    return assessment.userId === userId;
  },

  async _updateStateById({ id, state }, knexTransaction) {
    const assessment = await BookshelfAssessment.where({ id }).save(
      { state },
      { require: true, patch: true, transacting: knexTransaction }
    );
    return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment);
  },

  async updateLastQuestionDate({ id, lastQuestionDate }) {
    try {
      await BookshelfAssessment.where({ id }).save(
        { lastQuestionDate },
        { require: true, patch: true, method: 'update' }
      );
    } catch (err) {
      if (err instanceof BookshelfAssessment.NoRowsUpdatedError) {
        return null;
      }
      throw err;
    }
  },

  async updateWhenNewChallengeIsAsked({ id, lastChallengeId }) {
    try {
      await BookshelfAssessment.where({ id }).save(
        { lastChallengeId, lastQuestionState: Assessment.statesOfLastQuestion.ASKED },
        { require: true, patch: true, method: 'update' }
      );
    } catch (err) {
      if (err instanceof BookshelfAssessment.NoRowsUpdatedError) {
        return null;
      }
      throw err;
    }
  },

  async updateLastQuestionState({ id, lastQuestionState, domainTransaction }) {
    try {
      await BookshelfAssessment.where({ id }).save(
        { lastQuestionState },
        { require: true, patch: true, method: 'update', transacting: domainTransaction.knexTransaction }
      );
    } catch (err) {
      if (err instanceof BookshelfAssessment.NoRowsUpdatedError) {
        return null;
      }
      throw err;
    }
  },
};

function _selectLastAssessmentForEachCompetence(bookshelfAssessments) {
  const assessmentsGroupedByCompetence = groupBy(bookshelfAssessments, (bookshelfAssessment) =>
    bookshelfAssessment.get('competenceId')
  );
  return map(assessmentsGroupedByCompetence, head);
}

function _adaptModelToDb(assessment) {
  return omit(assessment, [
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
    'campaignCode',
  ]);
}
