const CertificationChallengeBookshelf = require('../../domain/models/data/certification-challenge');
const CertificationChallenge = require('../../domain/models/CertificationChallenge');
const { NotFoundError } = require('../../domain/errors');
const Bookshelf = require('../bookshelf');

function _toDomain(model) {
  return new CertificationChallenge({
    id: model.get('id'),
    challengeId: model.get('challengeId'),
    competenceId: model.get('competenceId'),
    associatedSkill: model.get('associatedSkill'),
    courseId: model.get('courseId')
  });
}

module.exports = {
  save(challenge, certificationCourse) {
    const certificationChallenge = new CertificationChallengeBookshelf({
      challengeId: challenge.id,
      competenceId: challenge.competence,
      associatedSkill: challenge.testedSkill,
      courseId: certificationCourse.id
    });

    return certificationChallenge.save()
      .then((certificationChallenge) => {
        return _toDomain(certificationChallenge);
      });
  },

  findChallengesByCertificationCourseId(courseId) {
    return CertificationChallengeBookshelf
      .where({ courseId })
      .fetchAll()
      .then((collection) => {
        return collection.map((certificationChallenge) => _toDomain(certificationChallenge));
      });
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
        if(certificationChallenge === null) {
          throw new NotFoundError();
        }

        return _toDomain(certificationChallenge);
      });
  },

  findByCertificationCourseId(certificationCourseId) {
    return CertificationChallengeBookshelf
      .where({ courseId: certificationCourseId })
      .fetchAll()
      .then(challenges => challenges.models);
  }
};
