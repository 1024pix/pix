import { AssessmentEndedError } from '../../../shared/domain/errors.js';
import { _ } from '../../../shared/infrastructure/utils/lodash-utils.js';

export async function getNextChallengeForDemo({ assessment, answerRepository, courseRepository }) {
  const course = await courseRepository.get(assessment.courseId);
  const answers = await answerRepository.findByAssessment(assessment.id);
  const nextChallengeId = _selectNextChallengeId(course, answers);
  if (!nextChallengeId) {
    throw new AssessmentEndedError();
  }
  return nextChallengeId;
}

function _selectNextChallengeId(course, answers) {
  const courseChallengeIds = course.challenges;
  const answeredChallengeIds = _.map(answers, 'challengeId');

  return _(courseChallengeIds).difference(answeredChallengeIds).first();
}
