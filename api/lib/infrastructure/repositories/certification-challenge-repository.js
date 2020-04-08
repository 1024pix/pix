const Bookshelf = require('../bookshelf');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const CertificationChallengeBookshelf = require('../data/certification-challenge');
const logger = require('../../infrastructure/logger');

const { AssessmentEndedError } = require('../../domain/errors');

const logContext = {
  zone: 'certificationChallengeRepository.getNonAnsweredChallengeByCourseId',
  type: 'repository',
};

module.exports = {

  save(challenge, certificationCourse) {
    const certificationChallenge = new CertificationChallengeBookshelf({
      challengeId: challenge.id,
      competenceId: challenge.competenceId,
      associatedSkill: challenge.testedSkill,
      associatedSkillId: undefined,
      courseId: certificationCourse.id,
    });

    return certificationChallenge.save()
      .then((certificationChallenge) => {
        return bookshelfToDomainConverter.buildDomainObject(CertificationChallengeBookshelf, certificationChallenge);
      });
  },

  findByCertificationCourseId(certificationCourseId) {
    return CertificationChallengeBookshelf
      .where({ courseId: certificationCourseId })
      .fetchAll()
      .then((challenges) => bookshelfToDomainConverter.buildDomainObjects(CertificationChallengeBookshelf, challenges));
  },

  getNonAnsweredChallengeByCourseId(assessmentId, courseId) {

    const answeredChallengeIds = Bookshelf.knex('answers')
      .select('challengeId')
      .where({ assessmentId });

    return CertificationChallengeBookshelf
      .where({ courseId })
      .query((knex) => knex.whereNotIn('challengeId', answeredChallengeIds))
      .fetch()
      .then((certificationChallenge) => {
        if (certificationChallenge === null) {
          logger.trace(logContext, 'no found challenges');
          throw new AssessmentEndedError();
        }

        logContext.challengeId = certificationChallenge.id;
        logger.trace(logContext, 'found challenge');
        return bookshelfToDomainConverter.buildDomainObject(CertificationChallengeBookshelf, certificationChallenge);
      });
  },
};
