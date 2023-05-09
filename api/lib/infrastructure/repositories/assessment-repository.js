import { BookshelfAssessment } from '../orm-models/Assessment.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { Assessment } from '../../domain/models/Assessment.js';
import * as bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter.js';
import { groupBy, map, head, uniqBy, omit } from 'lodash';
import { NotFoundError } from '../../domain/errors.js';
import { knex } from '../../../db/knex-database-connection.js';

const getWithAnswers = async function (id) {
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
};

const get = async function (id, domainTransaction = DomainTransaction.emptyTransaction()) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const assessment = await knexConn('assessments').where({ id }).first();

  if (!assessment) {
    throw new NotFoundError("L'assessment n'existe pas ou son accès est restreint");
  }
  return new Assessment(assessment);
};

const findLastCompletedAssessmentsForEachCompetenceByUser = function (userId, limitDate) {
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
};

const getByAssessmentIdAndUserId = function (assessmentId, userId) {
  return BookshelfAssessment.query({ where: { id: assessmentId }, andWhere: { userId } })
    .fetch()
    .then((assessment) => bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment))
    .catch((error) => {
      if (error instanceof BookshelfAssessment.NotFoundError) {
        throw new NotFoundError();
      }

      throw error;
    });
};

const save = async function ({ assessment, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction.knexTransaction || knex;
  assessment.validate();
  const [assessmentCreated] = await knexConn('assessments').insert(_adaptModelToDb(assessment)).returning('*');
  return new Assessment(assessmentCreated);
};

const findNotAbortedCampaignAssessmentsByUserId = function (userId) {
  return BookshelfAssessment.where({ userId, type: 'CAMPAIGN' })
    .where('state', '!=', 'aborted')
    .fetchAll()
    .then((assessments) => bookshelfToDomainConverter.buildDomainObjects(BookshelfAssessment, assessments));
};

const abortByAssessmentId = function (assessmentId) {
  return this._updateStateById({ id: assessmentId, state: Assessment.states.ABORTED });
};

const completeByAssessmentId = function (assessmentId, domainTransaction = DomainTransaction.emptyTransaction()) {
  return this._updateStateById(
    { id: assessmentId, state: Assessment.states.COMPLETED },
    domainTransaction.knexTransaction
  );
};

const endBySupervisorByAssessmentId = function (assessmentId) {
  return this._updateStateById({ id: assessmentId, state: Assessment.states.ENDED_BY_SUPERVISOR });
};

const getByCertificationCandidateId = async function (certificationCandidateId) {
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
};

const ownedByUser = async function ({ id, userId = null }) {
  const assessment = await knex('assessments').select('userId').where({ id }).first();

  if (!assessment) {
    return false;
  }

  return assessment.userId === userId;
};

const _updateStateById = async function ({ id, state }, knexTransaction) {
  const assessment = await BookshelfAssessment.where({ id }).save(
    { state },
    { require: true, patch: true, transacting: knexTransaction }
  );
  return bookshelfToDomainConverter.buildDomainObject(BookshelfAssessment, assessment);
};

const updateLastQuestionDate = async function ({ id, lastQuestionDate }) {
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
};

const updateWhenNewChallengeIsAsked = async function ({ id, lastChallengeId }) {
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
};

const updateLastQuestionState = async function ({ id, lastQuestionState, domainTransaction }) {
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
};

export {
  getWithAnswers,
  get,
  findLastCompletedAssessmentsForEachCompetenceByUser,
  getByAssessmentIdAndUserId,
  save,
  findNotAbortedCampaignAssessmentsByUserId,
  abortByAssessmentId,
  completeByAssessmentId,
  endBySupervisorByAssessmentId,
  getByCertificationCandidateId,
  ownedByUser,
  _updateStateById,
  updateLastQuestionDate,
  updateWhenNewChallengeIsAsked,
  updateLastQuestionState,
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
