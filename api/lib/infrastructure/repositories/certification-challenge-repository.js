const Bookshelf = require('../bookshelf');
const { knex } = require('../bookshelf');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const DomainTransaction = require('../DomainTransaction');
const CertificationChallengeBookshelf = require('../orm-models/CertificationChallenge');
const CertificationChallenge = require('../../domain/models/CertificationChallenge');
const logger = require('../../infrastructure/logger');

const { AssessmentEndedError } = require('../../domain/errors');

const logContext = {
  zone: 'certificationChallengeRepository.getNextNonAnsweredChallengeByCourseId',
  type: 'repository',
};

module.exports = {

  async saveWithOrder({ certificationCourseId, certificationChallenges, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction.knexTransaction || knex;
    const dtos = certificationChallenges.map((certificationChallenge) => {
      return {
        challengeId: certificationChallenge.challengeId,
        competenceId: certificationChallenge.competenceId,
        associatedSkillName: certificationChallenge.associatedSkillName,
        associatedSkillId: certificationChallenge.associatedSkillId,
        courseId: certificationCourseId,
        certifiableBadgeKey: certificationChallenge.certifiableBadgeKey,
      };
    });
    const savedCertificationChallengesDTOs = await knexConn.batchInsert('certification-challenges', dtos).returning('*');
    return savedCertificationChallengesDTOs.map((dto) => new CertificationChallenge(dto));
  },

  async getNextNonAnsweredChallengeByCourseId(assessmentId, courseId) {
    const answeredChallengeIds = Bookshelf.knex('answers')
      .select('challengeId')
      .where({ assessmentId });

    const certificationChallenge = await CertificationChallengeBookshelf
      .where({ courseId })
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
