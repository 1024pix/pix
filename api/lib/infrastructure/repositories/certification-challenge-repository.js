const Bookshelf = require('../bookshelf.js');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter.js');
const DomainTransaction = require('../DomainTransaction.js');
const CertificationChallengeBookshelf = require('../orm-models/CertificationChallenge.js');
const logger = require('../../infrastructure/logger.js');

const { AssessmentEndedError } = require('../../domain/errors.js');

const logContext = {
  zone: 'certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId',
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
      certifiableBadgeKey: certificationChallenge.certifiableBadgeKey,
    });
    const savedCertificationChallenge = await certificationChallengeToSave.save(null, {
      transacting: domainTransaction.knexTransaction,
    });
    return bookshelfToDomainConverter.buildDomainObject(CertificationChallengeBookshelf, savedCertificationChallenge);
  },

  async getNextNonAnsweredChallengeByCourseId(assessmentId, courseId) {
    const answeredChallengeIds = Bookshelf.knex('answers').select('challengeId').where({ assessmentId });

    const certificationChallenge = await CertificationChallengeBookshelf.where({ courseId })
      .query((knex) => knex.whereNotIn('challengeId', answeredChallengeIds))
      .orderBy('id', 'asc')
      .fetch({ require: false });

    if (certificationChallenge === null) {
      logger.trace(logContext, 'no found challenges');
      throw new AssessmentEndedError();
    }

    logContext.challengeId = certificationChallenge.id;
    logger.trace(logContext, 'found challenge');
    return bookshelfToDomainConverter.buildDomainObject(CertificationChallengeBookshelf, certificationChallenge);
  },
};
