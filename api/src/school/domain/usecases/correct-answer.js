import { Examiner } from '../../../shared/domain/models/Examiner.js';

const correctAnswer = async function ({
  activityAnswer,
  assessmentId,
  activityAnswerRepository,
  sharedChallengeRepository,
  activityRepository,
  examiner,
} = {}) {
  const challenge = await sharedChallengeRepository.get(activityAnswer.challengeId);
  const correctedAnswer = _evaluateAnswer({ challenge, activityAnswer, examiner });
  let activityId = null;

  if (assessmentId) {
    activityId = (await activityRepository.getLastActivity(assessmentId)).id;
  }

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
