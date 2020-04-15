const Bookshelf = require('../bookshelf');
const CertificationChallenge = require('../../domain/models/CertificationChallenge');
const CertificationChallengeBookshelf = require('../data/certification-challenge');
const logger = require('../../infrastructure/logger');

const { AssessmentEndedError } = require('../../domain/errors');

const logContext = {
  zone: 'certificationChallengeRepository.getNonAnsweredChallengeByCourseId',
  type: 'repository',
};

function _toDomain(model) {
  return new CertificationChallenge({
    id: model.get('id'),
    challengeId: model.get('challengeId'),
    competenceId: model.get('competenceId'),
    associatedSkillName: model.get('associatedSkill'),
    associatedSkillId: model.get('associatedSkillId'),
    courseId: model.get('courseId'),
  });
}

module.exports = {

  save(certificationChallenge) {
    const certificationChallengeToSave = new CertificationChallengeBookshelf({
      challengeId: certificationChallenge.challengeId,
      competenceId: certificationChallenge.competenceId,
      associatedSkill: certificationChallenge.associatedSkillName,
      associatedSkillId: certificationChallenge.associatedSkillId,
      courseId: certificationChallenge.courseId,
    });
    return certificationChallengeToSave.save()
      .then((certificationChallenge) => {
        return _toDomain(certificationChallenge);
      });
  },

  findByCertificationCourseId(certificationCourseId) {
    return CertificationChallengeBookshelf
      .where({ courseId: certificationCourseId })
      .fetchAll()
      .then((challenges) => challenges.models.map(_toDomain));
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
        return _toDomain(certificationChallenge);
      });
  },
};
