import { Examiner } from '../../../shared/domain/models/Examiner.js';

import * as injectedChallengeRepository from '../../../shared/infrastructure/repositories/challenge-repository.js';

const correctPreviewAnswer = async function ({ activityAnswer, challengeRepository = injectedChallengeRepository, examiner: injectedExaminer } = {}) {
  const challenge = await challengeRepository.get(activityAnswer.challengeId);
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  const correctedAnswer = examiner.evaluate({
    answer: activityAnswer,
    challengeFormat: challenge.format,
  });
  return {
    ...correctedAnswer,
    id: 'preview-id',
  };
};

export { correctPreviewAnswer };
