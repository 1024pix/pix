const { AssessmentEndedError } = require('../errors');
const _ = require('../../infrastructure/utils/lodash-utils');
const logger = require('../../infrastructure/logger');

module.exports = function getNextChallengeForDemo({
  assessment,
  answerRepository,
  challengeRepository,
  courseRepository,
}) {

  let courseId;
  let campaignId;

  if (process.env.IS_PIX_CONTEST === 'true') {
    campaignId = assessment.courseId;
  }
  else {
    courseId = assessment.courseId;
  }

  const logContext = {
    zone: 'usecase.getNextChallengeForDemo',
    type: 'usecase',
    assessmentId: assessment.id,
    courseId,
  };
  logger.trace(logContext, 'looking for next challenge in DEMO assessment');

  return Promise.all([
    process.env.IS_PIX_CONTEST === 'true' ?
      courseRepository.getByCampaignId(campaignId)
      : courseRepository.get(courseId),
    answerRepository.findByAssessment(assessment.id),
  ])
    .then(([course, answers]) => {
      logContext.courseId = course.id;
      logger.trace(logContext, 'found course, selecting challenge');
      return _selectNextChallengeId(course, answers);
    })
    .then((nextChallengeId) => {
      if (nextChallengeId) {
        logContext.nextChallengeId = nextChallengeId;
        logger.trace(logContext, 'found next challenge');
        return nextChallengeId;
      }

      logger.trace(logContext, 'no next challenge. Assessment ended');
      throw new AssessmentEndedError();
    })
    .then(challengeRepository.get);
};

function _selectNextChallengeId(course, answers) {
  const courseChallengeIds = course.challenges;
  const answeredChallengeIds = _.map(answers, 'challengeId');

  return _(courseChallengeIds).difference(answeredChallengeIds).first();
}
