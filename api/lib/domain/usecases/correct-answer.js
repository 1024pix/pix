const Examiner = require('../models/Examiner');

module.exports = async function correctAnswer({ answer, challengeId, challengeRepository, examiner } = {}) {
  const challenge = await challengeRepository.get(challengeId);
  const result = _evaluateAnswer({ challenge, answer, examiner });
  return result;
};

// Evaluation temporaire sans enregistrement de la réponse. Utiliser correct-answer-then-update-assessment après ? Peut être...
function _evaluateAnswer({ challenge, answer, examiner: injectedExaminer }) {
  const examiner = injectedExaminer ?? new Examiner({ validator: challenge.validator });
  return examiner.evaluate({
    answer,
    challengeFormat: challenge.format,
  });
}
