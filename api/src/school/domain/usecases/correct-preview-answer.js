import { Examiner } from '../../../shared/domain/models/Examiner.js';

const correctPreviewAnswer = async function ({
  activityAnswer,
  sharedChallengeRepository,
  examiner: injectedExaminer,
} = {}) {
  const challenge = await sharedChallengeRepository.get(activityAnswer.challengeId);
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  return examiner.evaluate({
    answer: activityAnswer,
    challengeFormat: challenge.format,
  });
};

export { correctPreviewAnswer };
