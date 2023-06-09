import { Examiner } from '../models/Examiner.js';

const correctAnswer = async function ({
  activityAnswer,
  assessmentId,
  activityAnswerRepository,
  challengeRepository,
  activityRepository,
  examiner,
} = {}) {
  const challenge = await challengeRepository.get(activityAnswer.challengeId);
  const correctedAnswer = _evaluateAnswer({ challenge, activityAnswer, examiner });
  const activity = await activityRepository.getLastActivity(assessmentId);

  return await activityAnswerRepository.save({ ...correctedAnswer, activityId: activity.id });
};

function _evaluateAnswer({ challenge, activityAnswer, examiner: injectedExaminer }) {
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  return examiner.evaluate({
    answer: activityAnswer,
    challengeFormat: challenge.format,
  });
}

export { correctAnswer };
