const solutionServiceQcm = require('./solution-service-qcm');
const solutionServiceQroc = require('./solution-service-qroc');
const solutionServiceQrocmInd = require('./solution-service-qrocm-ind');

module.exports = {

  match(answer, solution) {

    const answerValue = answer.get('value');
    const solutionValue = solution.value;

    if ('#ABAND#' === answerValue) {
      return 'aband';
    }

    if (solution.type === 'QRU') {
      return 'pending';
    }

    if (solution.type === 'QCU') {
      return (answerValue === solutionValue) ? 'ok' : 'ko';
    }

    if (solution.type === 'QCM') {
      return solutionServiceQcm.match(answerValue, solutionValue);
    }

    if (solution.type === 'QROC') {
      return solutionServiceQroc.match(answerValue, solutionValue);
    }

    if (solution.type === 'QROCM-ind') {
      return solutionServiceQrocmInd.match(answerValue, solutionValue);
    }    

    return 'pending';
  }

};
