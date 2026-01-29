import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CertificationChallenge } from '../../domain/models/CertificationChallenge.js';

const logContext = {
  zone: 'certificationChallengeRepository.getNextChallengeByCourseId',
  type: 'repository',
};

const save = async function ({ certificationChallenge }) {
  const knexConn = DomainTransaction.getConnection();
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
  const [savedCertificationChallenge] = await knexConn('certification-challenges')
    .insert(certificationChallengeToSave)
    .returning('*');

  return new CertificationChallenge(savedCertificationChallenge);
};

const getNextChallengeByCourseId = async function (courseId, ignoredChallengeIds) {
  const knexConn = DomainTransaction.getConnection();
  const certificationChallenge = await knexConn('certification-challenges')
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

export { getNextChallengeByCourseId, save };
