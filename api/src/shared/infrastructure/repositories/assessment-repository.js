import lodash from 'lodash';

import * as campaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import { DomainTransaction } from '../../domain/DomainTransaction.js';
import { NotFoundError } from '../../domain/errors.js';
import { Assessment } from '../../domain/models/Assessment.js';

const { uniqBy, omit } = lodash;

const getWithAnswers = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const [assessment] = await knexConn('assessments').where('assessments.id', id);
  if (!assessment) {
    throw new NotFoundError(`Assessment not found for ID ${id}`);
  }

  const answers = await knexConn('answers')
    .select('id', 'challengeId', 'value')
    .where('assessmentId', id)
    .orderBy('createdAt');
  assessment.answers = uniqBy(answers, 'challengeId');
  return new Assessment({
    ...assessment,
    campaign: await _getAssociatedCampaign(assessment.campaignParticipationId),
  });
};

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const assessment = await knexConn('assessments').where({ id }).first();

  if (!assessment) {
    throw new NotFoundError("L'assessment n'existe pas ou son accès est restreint");
  }
  return new Assessment({
    ...assessment,
    campaign: await _getAssociatedCampaign(assessment.campaignParticipationId),
  });
};

const findLastCompletedAssessmentsForEachCompetenceByUser = async function (userId, limitDate) {
  const knexConn = DomainTransaction.getConnection();
  const lastCompletedAssessments = await knexConn('assessments')
    .select('assessments.*')
    .join('assessment-results', 'assessment-results.assessmentId', 'assessments.id')
    .where({ 'assessments.userId': userId })
    .where({ 'assessments.type': 'PLACEMENT' })
    .where('assessments.createdAt', '<', limitDate)
    .where('assessment-results.createdAt', '<', limitDate)
    .where('assessments.state', '=', 'completed')
    .orderBy('assessments.createdAt', 'desc');
  return _selectMostRecentAssessmentForEachCompetence(lastCompletedAssessments).map(
    (assessment) => new Assessment(assessment),
  );
};

const getByAssessmentIdAndUserId = async function (assessmentId, userId) {
  const knexConn = DomainTransaction.getConnection();
  const assessment = await knexConn('assessments').where({ id: assessmentId, userId }).first();
  if (!assessment) throw new NotFoundError();
  return new Assessment({
    ...assessment,
    campaign: await _getAssociatedCampaign(assessment.campaignParticipationId),
  });
};

const save = async function ({ assessment }) {
  const knexConn = DomainTransaction.getConnection();
  assessment.validate();
  const [assessmentCreated] = await knexConn('assessments').insert(_adaptModelToDb(assessment)).returning('*');
  return new Assessment({
    ...assessmentCreated,
    campaign: await _getAssociatedCampaign(assessmentCreated.campaignParticipationId),
  });
};

const findNotAbortedCampaignAssessmentsByUserId = async function (userId) {
  const knexConn = DomainTransaction.getConnection();
  const assessmentDTOs = await knexConn('assessments')
    .where({ userId, type: 'CAMPAIGN' })
    .andWhere('state', '!=', 'aborted');
  const assessments = [];
  for (const assessmentDTO of assessmentDTOs) {
    assessments.push(
      new Assessment({
        ...assessmentDTO,
        campaign: await _getAssociatedCampaign(assessmentDTO.campaignParticipationId),
      }),
    );
  }
  return assessments;
};

async function _getAssociatedCampaign(campaignParticipationId) {
  let campaign;
  if (campaignParticipationId) {
    const campaignId = await campaignRepository.getCampaignIdByCampaignParticipationId(campaignParticipationId);
    campaign = await campaignRepository.get(campaignId);
  }
  return campaign;
}

const abortByAssessmentId = function (assessmentId) {
  return _updateStateById({ id: assessmentId, state: Assessment.states.ABORTED });
};

const completeByAssessmentId = function (assessmentId) {
  return _updateStateById({ id: assessmentId, state: Assessment.states.COMPLETED });
};

const getByCertificationCandidateId = async function (certificationCandidateId) {
  const knexConn = DomainTransaction.getConnection();
  const assessment = await knexConn('assessments')
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
  const knexConn = DomainTransaction.getConnection();
  const assessment = await knexConn('assessments').select('userId').where({ id }).first();

  if (!assessment) {
    return false;
  }

  return assessment.userId === userId;
};

const _updateStateById = async function ({ id, state }) {
  const knexConn = DomainTransaction.getConnection();
  const [assessment] = await knexConn('assessments')
    .where({ id })
    .update({ state, updatedAt: new Date() })
    .returning('*');
  return new Assessment({
    ...assessment,
    campaign: await _getAssociatedCampaign(assessment.campaignParticipationId),
  });
};

const updateLastQuestionDate = async function ({ id, lastQuestionDate }) {
  const knexConn = DomainTransaction.getConnection();
  const [assessmentUpdated] = await knexConn('assessments')
    .where({ id })
    .update({ lastQuestionDate, updatedAt: knexConn.fn.now() })
    .returning('*');
  if (!assessmentUpdated) return null;
};

const updateWhenNewChallengeIsAsked = async function ({ id, lastChallengeId }) {
  const knexConn = DomainTransaction.getConnection();
  const [assessmentUpdated] = await knexConn('assessments')
    .where({ id })
    .update({ lastChallengeId, lastQuestionState: Assessment.statesOfLastQuestion.ASKED, updatedAt: new Date() })
    .returning('*');
  if (!assessmentUpdated) return null;
  return new Assessment({
    ...assessmentUpdated,
    campaign: await _getAssociatedCampaign(assessmentUpdated.campaignParticipationId),
  });
};

const updateLastQuestionState = async function ({ id, lastQuestionState }) {
  const knexConn = DomainTransaction.getConnection();
  const [assessmentUpdated] = await knexConn('assessments')
    .where({ id })
    .update({ lastQuestionState, updatedAt: new Date() })
    .returning('*');
  if (!assessmentUpdated) return null;
};

const setAssessmentsAsStarted = async function ({ assessmentIds }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('assessments')
    .whereIn('id', assessmentIds)
    .update({ state: Assessment.states.STARTED, updatedAt: new Date() });
};

const getByCampaignParticipationIds = async function (campaignParticipationIds = []) {
  const knexConn = DomainTransaction.getConnection();
  const assessments = await knexConn('assessments')
    .whereIn('campaignParticipationId', campaignParticipationIds)
    .orderBy('id', 'asc');
  return assessments.map((assessment) => new Assessment({ ...assessment }));
};

const updateCampaignParticipationId = async function (assessment) {
  const knexConn = DomainTransaction.getConnection();
  const [assessmentUpdated] = await knexConn('assessments')
    .update({ campaignParticipationId: assessment.campaignParticipationId, updatedAt: assessment.updatedAt })
    .where('id', assessment.id)
    .returning('*');
  if (!assessmentUpdated) return null;
};

export {
  abortByAssessmentId,
  completeByAssessmentId,
  findLastCompletedAssessmentsForEachCompetenceByUser,
  findNotAbortedCampaignAssessmentsByUserId,
  get,
  getByAssessmentIdAndUserId,
  getByCampaignParticipationIds,
  getByCertificationCandidateId,
  getWithAnswers,
  ownedByUser,
  save,
  setAssessmentsAsStarted,
  updateCampaignParticipationId,
  updateLastQuestionDate,
  updateLastQuestionState,
  updateWhenNewChallengeIsAsked,
};

function _selectMostRecentAssessmentForEachCompetence(assessments) {
  const assessmentsGroupedByCompetence = Object.groupBy(assessments, (assessment) => assessment.competenceId);
  return Object.values(assessmentsGroupedByCompetence).map((group) => group[0]);
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
    'challengeLiveAlerts',
    'companionLiveAlerts',
    'showChallengeStepper',
    'hasCheckpoints',
    'showLevelup',
    'showQuestionCounter',
  ]);
}
