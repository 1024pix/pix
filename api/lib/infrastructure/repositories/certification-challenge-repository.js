const Bookshelf = require('../bookshelf');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');
const CertificationChallengeBookshelf = require('../data/certification-challenge');
const logger = require('../../infrastructure/logger');

const { AssessmentEndedError } = require('../../domain/errors');

const logContext = {
  zone: 'certificationChallengeRepository.getNonAnsweredChallengeByCourseId',
  type: 'repository',
};

module.exports = {

  async save({ certificationChallenge, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const certificationChallengeToSave = new CertificationChallengeBookshelf({
      challengeId: certificationChallenge.challengeId,
      competenceId: certificationChallenge.competenceId,
      associatedSkillName: certificationChallenge.associatedSkillName,
      associatedSkillId: certificationChallenge.associatedSkillId,
      courseId: certificationChallenge.courseId,
    });
    const savedCertificationChallenge = await certificationChallengeToSave.save(null, { transacting: domainTransaction.knexTransaction });
    return bookshelfToDomainConverter.buildDomainObject(CertificationChallengeBookshelf, savedCertificationChallenge);
  },

  async findByCertificationCourseId(certificationCourseId) {
    const certificationChallenges = await CertificationChallengeBookshelf
      .where({ courseId: certificationCourseId })
      .fetchAll();

    return bookshelfToDomainConverter.buildDomainObjects(CertificationChallengeBookshelf, certificationChallenges);
  },

  async getNonAnsweredChallengeByCourseId(assessmentId, courseId) {
    const answeredChallengeIds = Bookshelf.knex('answers')
      .select('challengeId')
      .where({ assessmentId });

    const certificationChallenge = await CertificationChallengeBookshelf
      .where({ courseId })
      .query((knex) => knex.whereNotIn('challengeId', answeredChallengeIds))
      .fetch();

    if (certificationChallenge === null) {
      logger.trace(logContext, 'no found challenges');
      throw new AssessmentEndedError();
    }

    logContext.challengeId = certificationChallenge.id;
    logger.trace(logContext, 'found challenge');
    return bookshelfToDomainConverter.buildDomainObject(CertificationChallengeBookshelf, certificationChallenge);
  },
};
