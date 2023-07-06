import { Examiner } from '../models/Examiner.js';
import { logger } from '../../infrastructure/logger.js';

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
  let activity;
  //FIXME Contournement moche moche du cas PREVIEW
  try {
    activity = await activityRepository.getLastActivity(assessmentId);
  } catch (error) {
    logger.info(`No activity found for assessment: ${assessmentId}`);
  }

  return await activityAnswerRepository.save({ ...correctedAnswer, activityId: activity?.id });
};

function _evaluateAnswer({ challenge, activityAnswer, examiner: injectedExaminer }) {
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  return examiner.evaluate({
    answer: activityAnswer,
    challengeFormat: challenge.format,
  });
}

export { correctAnswer };
