const { AssessmentEndedError } = require('../errors');
const _ = require('../../infrastructure/utils/lodash-utils');

module.exports = function({ assessment, challengeId, courseRepository, challengeRepository }) {

  const courseId = assessment.courseId;

  return courseRepository.get(courseId)
    .then(course => _selectNextChallengeId(course, challengeId))
    .then((nextChallenge) => {
      if (nextChallenge) {
        return nextChallenge;
      }

      throw new AssessmentEndedError();
    })
    .then(challengeRepository.get);
};

function _selectNextChallengeId(course, currentChallengeId) {
  const challenges = course.challenges;

  if (!currentChallengeId) { // no currentChallengeId means the test has not yet started
    return Promise.resolve(_.first(challenges));
  }

  return Promise.resolve(_selectNextInNormalMode(currentChallengeId, challenges));
}

function _selectNextInNormalMode(currentChallengeId, challenges) {

  /*
   * example : - if challenges is ["1st_challenge", "2nd_challenge", "3rd_challenge", "4th_challenge"]
   *           - and currentChallengeId is "2nd_challenge"
   *
   *           nextChallengeId will be "3rd_challenge"
   */
  const nextChallengeId = _(challenges).elementAfter(currentChallengeId).value();
  return _.defaultTo(nextChallengeId, null); // result MUST be null if not found

}
