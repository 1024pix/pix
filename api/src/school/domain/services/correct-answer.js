import { NotInProgressAssessmentError } from '../../../../src/school/domain/school-errors.js';
import { ChallengeNotAskedError } from '../../../shared/domain/errors.js';
import { Examiner } from '../../../shared/domain/models/Examiner.js';
import { Assessment } from '../models/Assessment.js';

const correctAnswer = async function ({
  activityAnswer,
  assessmentId,
  activityAnswerRepository,
  challengeRepository,
  activityRepository,
  assessmentRepository,
  examiner: injectedExaminer,
} = {}) {
  const assessment = await assessmentRepository.get(assessmentId);

  if (assessment.state !== Assessment.states.STARTED) {
    throw new NotInProgressAssessmentError(assessmentId);
  }

  if (assessment.lastChallengeId !== activityAnswer.challengeId) {
    throw new ChallengeNotAskedError();
  }

  const activityId = (await activityRepository.getLastActivity(assessmentId)).id;
  const challenge = await challengeRepository.get(activityAnswer.challengeId);
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  const correctedAnswer = examiner.evaluate({
    answer: activityAnswer,
    challengeFormat: challenge.format,
  });

  return await activityAnswerRepository.save({ ...correctedAnswer, activityId });
};

export { correctAnswer };
