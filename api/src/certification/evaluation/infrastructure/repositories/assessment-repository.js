import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';

const get = async function (id) {
  const knexConn = DomainTransaction.getConnection();
  const assessment = await knexConn('assessments').where({ id }).forUpdate().first();

  if (!assessment) {
    throw new NotFoundError("L'assessment n'existe pas ou son accès est restreint");
  }
  return new Assessment(assessment);
};

const updateLastQuestionDate = async function (assessment) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('assessments')
    .where({ id: assessment.id })
    .update({ lastQuestionDate: assessment.lastQuestionDate, updatedAt: new Date() });
};

const updateWhenNewChallengeIsAsked = async function (assessment) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('assessments').where({ id: assessment.id }).update({
    lastChallengeId: assessment.lastChallengeId,
    lastQuestionState: Assessment.statesOfLastQuestion.ASKED,
    updatedAt: new Date(),
  });
};

const updateStateById = async function (assessmentId, state) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('assessments')
    .where({ id: assessmentId })
    .update({ state });
}

export { get, updateLastQuestionDate, updateWhenNewChallengeIsAsked, updateStateById };
