import { knex } from '../../../../../db/knex-database-connection.js';
import { AssessmentEndedError } from '../../../../../lib/domain/errors.js';
import { CertificationChallenge } from '../../../../../lib/domain/models/CertificationChallenge.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import { logInfoWithCorrelationIds } from '../../../../../lib/infrastructure/monitoring-tools.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';

const logContext = {
  zone: 'certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId',
  type: 'repository',
};

const save = async function ({ certificationChallenge, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const certificationChallengeToSave = new CertificationChallenge({
    challengeId: certificationChallenge.challengeId,
    competenceId: certificationChallenge.competenceId,
    associatedSkillName: certificationChallenge.associatedSkillName,
    associatedSkillId: certificationChallenge.associatedSkillId,
    courseId: certificationChallenge.courseId,
    certifiableBadgeKey: certificationChallenge.certifiableBadgeKey,
    difficulty: certificationChallenge.difficulty,
    discriminant: certificationChallenge.discriminant,
  });
  const knexConn = domainTransaction.knexTransaction || knex;
  const [savedCertificationChallenge] = await knexConn('certification-challenges')
    .insert(certificationChallengeToSave)
    .returning('*');

  return new CertificationChallenge(savedCertificationChallenge);
};

const getNextNonAnsweredChallengeByCourseId = async function (assessmentId, courseId) {
  const answeredChallengeIds = knex('answers').select('challengeId').where({ assessmentId });

  const certificationChallenge = await knex('certification-challenges')
    .where({ courseId })
    .whereNotIn('challengeId', answeredChallengeIds)
    .orderBy('id', 'asc')
    .first();

  if (!certificationChallenge) {
    logInfoWithCorrelationIds(logContext, `no found challenges for certificationCourseId : ${courseId}`);
    throw new AssessmentEndedError();
  }

  logContext.challengeId = certificationChallenge.id;
  logger.trace(logContext, 'found challenge');
  return new CertificationChallenge(certificationChallenge);
};

const getNextChallengeByCourseIdForV3 = async function (courseId, ignoredChallengeIds) {
  const certificationChallenge = await knex('certification-challenges')
    .where({ courseId })
    .whereNotIn('challengeId', ignoredChallengeIds)
    .orderBy('id', 'asc')
    .first();

  if (!certificationChallenge) {
    return null;
  }

  logContext.challengeId = certificationChallenge.id;
  logger.trace(logContext, 'found challenge');

  return new CertificationChallenge(certificationChallenge);
};

export { getNextChallengeByCourseIdForV3, getNextNonAnsweredChallengeByCourseId, save };
