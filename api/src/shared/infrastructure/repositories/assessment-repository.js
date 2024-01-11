import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Assessment } from '../../domain/models/Assessment.js';
import lodash from 'lodash';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { knex } from '../../../../db/knex-database-connection.js';

const { groupBy, map, head, uniqBy, omit } = lodash;

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

const findLastCompletedAssessmentsForEachCompetenceByUser = async function (userId, limitDate) {
  const lastCompletedAssessments = await knex('assessments')
    .select('assessments.*')
    .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .where({ 'assessments.userId': userId })
    .where({ 'assessments.type': 'PLACEMENT' })
    .where('assessments.createdAt', '<', limitDate)
    .where('assessment-results.createdAt', '<', limitDate)
    .where('assessments.state', '=', 'completed')
    .orderBy('assessments.createdAt', 'desc');
  return _selectLastAssessmentForEachCompetence(lastCompletedAssessments).map(
    (assessment) => new Assessment(assessment),
  );
};

const getByAssessmentIdAndUserId = async function (assessmentId, userId) {
  const assessment = await knex('assessments').where({ id: assessmentId, userId }).first();
  if (!assessment) throw new NotFoundError();
  return new Assessment(assessment);
};

const save = async function ({ assessment, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction.knexTransaction || knex;
  assessment.validate();
  const [assessmentCreated] = await knexConn('assessments').insert(_adaptModelToDb(assessment)).returning('*');
  return new Assessment(assessmentCreated);
};

const findNotAbortedCampaignAssessmentsByUserId = async function (userId) {
  const assessments = await knex('assessments').where({ userId, type: 'CAMPAIGN' }).andWhere('state', '!=', 'aborted');
  return assessments.map((assessment) => {
    return new Assessment(assessment);
  });
};

const abortByAssessmentId = function (assessmentId) {
  return this._updateStateById({ id: assessmentId, state: Assessment.states.ABORTED });
};

const completeByAssessmentId = function (assessmentId, domainTransaction = DomainTransaction.emptyTransaction()) {
  return this._updateStateById(
    { id: assessmentId, state: Assessment.states.COMPLETED },
    domainTransaction.knexTransaction,
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
        'certification-courses.sessionId',
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
  const knexConn = knexTransaction || knex;
  const [assessment] = await knexConn('assessments').where({ id }).update({ state }).returning('*');
  return new Assessment(assessment);
};

const updateLastQuestionDate = async function ({ id, lastQuestionDate }) {
  const [assessmentUpdated] = await knex('assessments').where({ id }).update({ lastQuestionDate }).returning('*');
  if (!assessmentUpdated) return null;
};

const updateWhenNewChallengeIsAsked = async function ({ id, lastChallengeId }) {
  const [assessmentUpdated] = await knex('assessments')
    .where({ id })
    .update({ lastChallengeId, lastQuestionState: Assessment.statesOfLastQuestion.ASKED })
    .returning('*');
  if (!assessmentUpdated) return null;
};

const updateLastQuestionState = async function ({ id, lastQuestionState, domainTransaction }) {
  const knexConn = domainTransaction.knexTransaction || knex;
  const [assessmentUpdated] = await knexConn('assessments').where({ id }).update({ lastQuestionState }).returning('*');
  if (!assessmentUpdated) return null;
};

const setAssessmentsAsStarted = async function ({
  assessmentIds,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction || knex;
  await knexConn('assessments').whereIn('id', assessmentIds).update({ state: Assessment.states.STARTED });
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
  setAssessmentsAsStarted,
};

function _selectLastAssessmentForEachCompetence(assessments) {
  const assessmentsGroupedByCompetence = groupBy(assessments, (assessment) => assessment.competenceId);
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
    'hasOngoingLiveAlert',
    'liveAlerts',
  ]);
}
