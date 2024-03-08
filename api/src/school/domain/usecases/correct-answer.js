import { ChallengeNotAskedError } from '../../../../lib/domain/errors.js';
import { NotInProgressAssessmentError } from '../../../../src/school/domain/school-errors.js';
import { Examiner } from '../../../shared/domain/models/Examiner.js';
import { Assessment } from '../models/Assessment.js';

const correctAnswer = async function ({
  activityAnswer,
  assessmentId,
  activityAnswerRepository,
  sharedChallengeRepository,
  activityRepository,
  assessmentRepository,
  examiner,
} = {}) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (assessment.state !== Assessment.states.STARTED) {
    throw new NotInProgressAssessmentError(assessmentId);
  }

  if (assessment.lastChallengeId && assessment.lastChallengeId != activityAnswer.challengeId) {
    throw new ChallengeNotAskedError();
  }

  const activityId = (await activityRepository.getLastActivity(assessmentId)).id;
  const challenge = await sharedChallengeRepository.get(activityAnswer.challengeId);
  const correctedAnswer = _evaluateAnswer({ challenge, activityAnswer, examiner });
  return await activityAnswerRepository.save({ ...correctedAnswer, activityId });
};

function _evaluateAnswer({ challenge, activityAnswer, examiner: injectedExaminer }) {
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  return examiner.evaluate({
    answer: activityAnswer,
    challengeFormat: challenge.format,
  });
}

export { correctAnswer };
