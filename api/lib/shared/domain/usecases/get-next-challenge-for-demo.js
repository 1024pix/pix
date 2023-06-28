import { AssessmentEndedError } from '../errors.js';
import { _ } from '../../infrastructure/utils/lodash-utils.js';
import { logger } from '../../infrastructure/logger.js';

const getNextChallengeForDemo = function ({ assessment, answerRepository, challengeRepository, courseRepository }) {
  const courseId = assessment.courseId;

  const logContext = {
    zone: 'usecase.getNextChallengeForDemo',
    type: 'usecase',
    assessmentId: assessment.id,
    courseId,
  };
  logger.trace(logContext, 'looking for next challenge in DEMO assessment');

  return Promise.all([courseRepository.get(courseId), answerRepository.findByAssessment(assessment.id)])
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

export { getNextChallengeForDemo };

function _selectNextChallengeId(course, answers) {
  const courseChallengeIds = course.challenges;
  const answeredChallengeIds = _.map(answers, 'challengeId');

  return _(courseChallengeIds).difference(answeredChallengeIds).first();
}
