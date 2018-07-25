const { AssessmentEndedError } = require('../errors');
const _ = require('../../infrastructure/utils/lodash-utils');
const logger = require('../../infrastructure/logger');

module.exports = function getNextChallengeForDemo({
  assessment,
  challengeId,
  challengeRepository,
  courseRepository,
}) {

  const courseId = assessment.courseId;

  const logContext = {
    zone: 'usecase.getNextChallengeForDemo',
    type: 'usecase',
    assessmendId: assessment.id,
    challengeId,
    courseId,
  };
  logger.trace(logContext, 'looking for next challenge in DEMO assessment');

  return courseRepository.get(courseId)
    .then(course => {
      logContext.courseId = course.id;
      logger.trace(logContext, 'found course, selecting challenge');
      return _selectNextChallengeId(course, challengeId);
    })
    .then((nextChallenge) => {
      if (nextChallenge) {
        logContext.nextChallengeId = nextChallenge.id;
        logger.trace(logContext, 'found next challenge');
        return nextChallenge;
      }

      logger.trace(logContext, 'no next challenge. Assessment ended');
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
