import { Examiner } from '../models/Examiner.js';

const correctAnswer = async function ({ answer, answerRepository, challengeRepository, examiner } = {}) {
  const challenge = await challengeRepository.get(answer.challengeId);
  const correctedAnswer = _evaluateAnswer({ challenge, answer, examiner });
  return await answerRepository.save(correctedAnswer);
};

function _evaluateAnswer({ challenge, answer, examiner: injectedExaminer }) {
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  return examiner.evaluate({
    answer,
    challengeFormat: challenge.format,
  });
}

export { correctAnswer };
