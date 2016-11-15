const solutionServiceQcu = require('./solution-service-qcu');
const solutionServiceQcm = require('./solution-service-qcm');

function removeAccentsSpacesUppercase(rawAnswer) {
  // Remove accents/diacritics in a string in JavaScript
  // http://stackoverflow.com/a/37511463/827989
  return rawAnswer.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

function fuzzyMatchingWithAnswers(userAnswer, correctAnswers) {
  userAnswer = removeAccentsSpacesUppercase(userAnswer);
  let correctAnswersList = correctAnswers.split('\n');
  for (let correctAnswer of correctAnswersList) {
    if (userAnswer == removeAccentsSpacesUppercase(correctAnswer)) {
      return true;
    }
  }
  return false;
}

module.exports = {

  match (answer, solution) {

    const answerValue = answer.get('value');
    const solutionValue = solution.value;

    if ('#ABAND#' === answerValue) {
      return 'aband';
    }

    if (solution.type === 'QRU') {
      return 'pending';
    }

    if (solution.type === 'QCU') {
      return solutionServiceQcu.match(answerValue, solutionValue);
    }

    if (solution.type === 'QCM') {
      return solutionServiceQcm.match(answerValue, solutionValue);
    }

    if (solution.type === 'QROC') {
      if (fuzzyMatchingWithAnswers(answer.get('value'), solution.value)) {
        return 'ok';
      }
      return 'ko';
    }

    return 'pending';
  }

};
