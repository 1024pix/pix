import { Examiner } from '../models/Examiner.js';

const correctAnswer = async function ({ answer, challengeRepository, examiner } = {}) {
  const challenge = await challengeRepository.get(answer.challengeId);
  const correctedAnswer = _evaluateAnswer({ challenge, answer, examiner });
  return await answerRepository.save(correctedAnswer);
};


// Evaluation temporaire sans enregistrement de la réponse. Utiliser correct-answer-then-update-assessment après ? Peut être...
function _evaluateAnswer({ challenge, answer, examiner: injectedExaminer }) {
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  return examiner.evaluate({
    answer,
    challengeFormat: challenge.format,
  });
}

export { correctAnswer };
