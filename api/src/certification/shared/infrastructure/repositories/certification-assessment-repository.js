import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { Answer } from '../../../../evaluation/domain/models/Answer.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationChallengeWithType } from '../../../../shared/domain/models/CertificationChallengeWithType.js';
import * as answerStatusDatabaseAdapter from '../../../../shared/infrastructure/adapters/answer-status-database-adapter.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import { CertificationAssessment } from '../../../session-management/domain/models/CertificationAssessment.js';

async function _getCertificationChallenges(certificationCourseId, knexConn) {
  const certificationChallengeRows = await knexConn('certification-challenges')
    .where({ courseId: certificationCourseId })
    .orderBy('challengeId', 'asc');

  const challengeIds = certificationChallengeRows.map(({ challengeId }) => challengeId);
  const challengesType = await challengeRepository.getManyTypes(challengeIds);

  return _.map(certificationChallengeRows, (certificationChallengeRow) => {
    return new CertificationChallengeWithType({
      ...certificationChallengeRow,
      type: challengesType[certificationChallengeRow.challengeId],
    });
  });
}

async function _getCertificationAnswersByDate(certificationAssessmentId, knexConn) {
  const answerRows = await knexConn('answers').where({ assessmentId: certificationAssessmentId }).orderBy('createdAt');
  const answerRowsWithoutDuplicate = _.uniqBy(answerRows, 'challengeId');

  return _.map(
    answerRowsWithoutDuplicate,
    (answerRow) =>
      new Answer({
        ...answerRow,
        result: answerStatusDatabaseAdapter.fromSQLString(answerRow.result),
      }),
  );
}

const get = async function (id) {
  const certificationAssessmentRows = await knex('assessments')
    .join('certification-courses', 'certification-courses.id', 'assessments.certificationCourseId')
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
    .where('assessments.id', '=', id)
    .limit(1);
  if (!certificationAssessmentRows[0]) {
    throw new NotFoundError(`L'assessment de certification ${id} n'existe pas ou son accès est restreint`);
  }
  const certificationChallenges = await _getCertificationChallenges(
    certificationAssessmentRows[0].certificationCourseId,
    knex,
  );
  const certificationAnswersByDate = await _getCertificationAnswersByDate(certificationAssessmentRows[0].id, knex);

  return new CertificationAssessment({
    ...certificationAssessmentRows[0],
    version: certificationAssessmentRows[0].version,
    certificationChallenges,
    certificationAnswersByDate,
  });
};

const getByCertificationCourseId = async function ({
  certificationCourseId,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  const knexConn = domainTransaction.knexTransaction || knex;
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
};

const getByCertificationCandidateId = async function ({ certificationCandidateId }) {
  const certificationAssessmentRow = await knex('assessments')
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
    knex,
  );
  const certificationAnswersByDate = await _getCertificationAnswersByDate(certificationAssessmentRow.id, knex);

  return new CertificationAssessment({
    ...certificationAssessmentRow,
    certificationChallenges,
    certificationAnswersByDate,
  });
};

const save = async function (certificationAssessment) {
  for (const challenge of certificationAssessment.certificationChallenges) {
    await knex('certification-challenges')
      .where({ id: challenge.id })
      .update(_.pick(challenge, ['isNeutralized', 'hasBeenSkippedAutomatically']));
  }
  for (const answer of certificationAssessment.certificationAnswersByDate) {
    await knex('answers')
      .where({ id: answer.id })
      .update({ result: answerStatusDatabaseAdapter.toSQLString(answer.result) });
  }

  await knex('assessments')
    .where({ certificationCourseId: certificationAssessment.certificationCourseId })
    .update({ state: certificationAssessment.state });

  await knex('certification-courses')
    .where({ id: certificationAssessment.certificationCourseId })
    .update({ endedAt: certificationAssessment.endedAt });
};

export { get, getByCertificationCandidateId, getByCertificationCourseId, save };
