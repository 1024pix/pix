import { Bookshelf } from '../bookshelf.js';
import * as bookshelfToDomainConverter from '../utils/bookshelf-to-domain-converter.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { BookshelfCertificationChallenge } from '../orm-models/CertificationChallenge.js';
import { logger } from '../../infrastructure/logger.js';
import { AssessmentEndedError } from '../../domain/errors.js';
import { knex } from '../../../db/knex-database-connection.js';
import { CertificationChallenge } from '../../domain/models/CertificationChallenge.js';

const logContext = {
  zone: 'certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId',
  type: 'repository',
};

const save = async function ({ certificationChallenge, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const certificationChallengeToSave = new BookshelfCertificationChallenge({
    challengeId: certificationChallenge.challengeId,
    competenceId: certificationChallenge.competenceId,
    associatedSkillName: certificationChallenge.associatedSkillName,
    associatedSkillId: certificationChallenge.associatedSkillId,
    courseId: certificationChallenge.courseId,
    certifiableBadgeKey: certificationChallenge.certifiableBadgeKey,
  });
  const savedCertificationChallenge = await certificationChallengeToSave.save(null, {
    transacting: domainTransaction.knexTransaction,
  });
  return bookshelfToDomainConverter.buildDomainObject(BookshelfCertificationChallenge, savedCertificationChallenge);
};

const getByChallengeIdAndCourseId = async function ({ challengeId, courseId }) {
  const certificationChallenge = await knex('certification-challenges').where({ challengeId, courseId }).first();

  if (!certificationChallenge) {
    return;
  }

  return new CertificationChallenge(certificationChallenge);
};

const getNextNonAnsweredChallengeByCourseId = async function (assessmentId, courseId) {
  const answeredChallengeIds = Bookshelf.knex('answers').select('challengeId').where({ assessmentId });

  const certificationChallenge = await BookshelfCertificationChallenge.where({ courseId })
    .query((knex) => knex.whereNotIn('challengeId', answeredChallengeIds))
    .orderBy('id', 'asc')
    .fetch({ require: false });

  if (certificationChallenge === null) {
    logger.trace(logContext, 'no found challenges');
    throw new AssessmentEndedError();
  }

  logContext.challengeId = certificationChallenge.id;
  logger.trace(logContext, 'found challenge');
  return bookshelfToDomainConverter.buildDomainObject(BookshelfCertificationChallenge, certificationChallenge);
};

export { save, getByChallengeIdAndCourseId, getNextNonAnsweredChallengeByCourseId };
