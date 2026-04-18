import { Examiner } from '../../../shared/domain/models/Examiner.js';

export async function correctPreviewAnswer({ activityAnswer, challengeForCorrectionApi, examiner: injectedExaminer }) {
  const challenge = await challengeForCorrectionApi.get(activityAnswer.challengeId);
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  const correctedAnswer = examiner.evaluate({
    answer: activityAnswer,
    challengeFormat: challenge.format,
  });
  return {
    ...correctedAnswer,
    id: 'preview-id',
  };
}
