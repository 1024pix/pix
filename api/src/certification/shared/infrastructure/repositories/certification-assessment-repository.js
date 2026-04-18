import { Answer } from '../../../../evaluation/domain/models/Answer.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import * as answerStatusDatabaseAdapter from '../../../../shared/infrastructure/adapters/answer-status-database-adapter.js';
import * as baseChallengeRepository from '../../../../shared/infrastructure/repositories/base-challenge-repository.js';
import { CertificationAssessment } from '../../../session-management/domain/models/CertificationAssessment.js';
import { CertificationChallengeWithType } from '../../domain/models/CertificationChallengeWithType.js';

export async function getByCertificationCourseId({ certificationCourseId }) {
  const knexConn = DomainTransaction.getConnection();
  const certificationAssessmentRow = await knexConn('assessments')
    .join('certification-courses', 'certification-courses.id', 'assessments.certificationCourseId')
    .select({
      id: 'assessments.id',
      userId: 'assessments.userId',
      certificationCourseId: 'certification-courses.id',
      createdAt: 'certification-courses.createdAt',
      completedAt: 'certification-courses.completedAt',
      endedAt: 'certification-courses.endedAt',
      version: 'certification-courses.version',
      state: 'assessments.state',
    })
    .where('assessments.certificationCourseId', '=', certificationCourseId)
    .first();
  if (!certificationAssessmentRow) {
    throw new NotFoundError(
      `L'assessment de certification avec un certificationCourseId de ${certificationCourseId} n'existe pas ou son accès est restreint`,
    );
  }
  const certificationChallenges = await _getCertificationChallenges(
    certificationAssessmentRow.certificationCourseId,
    knexConn,
  );
  const certificationAnswersByDate = await _getCertificationAnswersByDate(certificationAssessmentRow.id, knexConn);

  return new CertificationAssessment({
    ...certificationAssessmentRow,
    certificationChallenges,
    certificationAnswersByDate,
  });
}

export async function getByCertificationCandidateId({ certificationCandidateId }) {
  const knexConn = DomainTransaction.getConnection();

  const certificationAssessmentRow = await knexConn('assessments')
    .select({
      id: 'assessments.id',
      userId: 'assessments.userId',
      certificationCourseId: 'certification-courses.id',
      createdAt: 'certification-courses.createdAt',
      completedAt: 'certification-courses.completedAt',
      endedAt: 'certification-courses.endedAt',
      state: 'assessments.state',
      version: 'certification-courses.version',
    })
    .join('certification-courses', 'certification-courses.id', 'assessments.certificationCourseId')
    .join('certification-candidates', function () {
      this.on('certification-candidates.userId', 'certification-courses.userId').andOn(
        'certification-candidates.sessionId',
        'certification-courses.sessionId',
      );
    })
    .where({ 'certification-candidates.id': certificationCandidateId })
    .first();

  if (!certificationAssessmentRow) {
    throw new NotFoundError(
      `L'assessment de certification pour le candidat d'id ${certificationCandidateId} n'existe pas ou son accès est restreint`,
    );
  }
  const certificationChallenges = await _getCertificationChallenges(
    certificationAssessmentRow.certificationCourseId,
    knexConn,
  );
  const certificationAnswersByDate = await _getCertificationAnswersByDate(certificationAssessmentRow.id, knexConn);

  return new CertificationAssessment({
    ...certificationAssessmentRow,
    certificationChallenges,
    certificationAnswersByDate,
  });
}

export async function save(certificationAssessment) {
  const knexConn = DomainTransaction.getConnection();

  for (const challenge of certificationAssessment.certificationChallenges) {
    await knexConn('certification-challenges').where({ id: challenge.id }).update({
      isNeutralized: challenge.isNeutralized,
      hasBeenSkippedAutomatically: challenge.hasBeenSkippedAutomatically,
    });
  }
  for (const answer of certificationAssessment.certificationAnswersByDate) {
    await knexConn('answers')
      .where({ id: answer.id })
      .update({ result: answerStatusDatabaseAdapter.toSQLString(answer.result) });
  }

  await knexConn('assessments')
    .where({ certificationCourseId: certificationAssessment.certificationCourseId })
    .update({ state: certificationAssessment.state });

  await knexConn('certification-courses')
    .where({ id: certificationAssessment.certificationCourseId })
    .update({ endedAt: certificationAssessment.endedAt });
}

async function _getCertificationChallenges(certificationCourseId, knexConn) {
  const certificationChallengeRows = await knexConn('certification-challenges')
    .where({ courseId: certificationCourseId })
    .orderBy('challengeId', 'asc');

  const challengeIds = certificationChallengeRows.map(({ challengeId }) => challengeId);
  const baseChallenges = await baseChallengeRepository.getMany(challengeIds);
  const challengesMap = new Map(baseChallenges.map((baseChallenge) => [baseChallenge.id, baseChallenge.type]));

  return certificationChallengeRows.map((certificationChallengeRow) => {
    return new CertificationChallengeWithType({
      ...certificationChallengeRow,
      type: challengesMap.get(certificationChallengeRow.challengeId),
    });
  });
}

async function _getCertificationAnswersByDate(certificationAssessmentId, knexConn) {
  const answerDTOs = await knexConn
    .select(['id', 'result', 'resultDetails', 'timeout', 'value', 'assessmentId', 'challengeId', 'timeSpent'])
    .from('answers')
    .where({ assessmentId: certificationAssessmentId })
    .orderBy('createdAt', 'asc');
  const dedupedAnswerDTOs = uniqByChallenge(answerDTOs);
  return dedupedAnswerDTOs.map((answerDTO) => {
    return new Answer({
      ...answerDTO,
      result: answerStatusDatabaseAdapter.fromSQLString(answerDTO.result),
    });
  });
}

function uniqByChallenge(answerDTOs) {
  const map = new Map();

  for (const a of answerDTOs) {
    if (!map.has(a.challengeId)) {
      map.set(a.challengeId, a);
    }
  }

  return [...map.values()];
}
