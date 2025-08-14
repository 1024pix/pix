import { AssessmentEndedError } from '../../../shared/domain/errors.js';
import * as injectedAnswerRepository from '../../../shared/infrastructure/repositories/answer-repository.js';
import * as injectedChallengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';
import * as injectedCourseRepository from '../../../shared/infrastructure/repositories/course-repository.js';
import { _ } from '../../../shared/infrastructure/utils/lodash-utils.js';

const getNextChallengeForDemo = async function ({
  assessment,
  answerRepository = injectedAnswerRepository,
  challengeRepository = injectedChallengeRepository,
  courseRepository = injectedCourseRepository,
} = {}) {
  const course = await courseRepository.get(assessment.courseId);
  const answers = await answerRepository.findByAssessment(assessment.id);
  const nextChallengeId = _selectNextChallengeId(course, answers);
  if (!nextChallengeId) {
    throw new AssessmentEndedError();
  }
  return challengeRepository.get(nextChallengeId);
};

export { getNextChallengeForDemo };

function _selectNextChallengeId(course, answers) {
  const courseChallengeIds = course.challenges;
  const answeredChallengeIds = _.map(answers, 'challengeId');

  return _(courseChallengeIds).difference(answeredChallengeIds).first();
}
