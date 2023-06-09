import { Examiner } from '../models/Examiner.js';

const correctAnswer = async function ({
  answer,
  answerRepository,
  challengeRepository,
  activityRepository,
  examiner,
} = {}) {
  const challenge = await challengeRepository.get(answer.challengeId);
  const correctedAnswer = _evaluateAnswer({ challenge, answer, examiner });
  const activity = await activityRepository.getLastActivity(answer.assessmentId);

  return await answerRepository.save({ ...correctedAnswer, activityId: activity.id });
};

function _evaluateAnswer({ challenge, answer, examiner: injectedExaminer }) {
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  return examiner.evaluate({
    answer,
    challengeFormat: challenge.format,
  });
}

export { correctAnswer };
