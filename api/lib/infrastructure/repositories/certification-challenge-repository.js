import { DomainTransaction } from '../DomainTransaction.js';
import { logger } from '../../infrastructure/logger.js';
import { AssessmentEndedError } from '../../domain/errors.js';
import { knex } from '../../../db/knex-database-connection.js';
import { CertificationChallenge } from '../../domain/models/CertificationChallenge.js';

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
    logger.trace(logContext, 'no found challenges');
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

export { save, getNextNonAnsweredChallengeByCourseId, getNextChallengeByCourseIdForV3 };
