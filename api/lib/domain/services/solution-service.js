const _ = include('lib/utils/lodash-utils');
const solutionServiceQcm = require('./solution-service-qcm');
const solutionServiceQroc = require('./solution-service-qroc');
const solutionServiceQrocmInd = require('./solution-service-qrocm-ind');
const solutionServiceQrocmDep = require('./solution-service-qrocm-dep');

module.exports = {

  _timedOut(result, answerTimeout) {
    const isPartiallyOrCorrectAnswer = (result === 'ok' || result === 'partially');
    const hasTimedOut = _.isInteger(answerTimeout) && answerTimeout < 0;

    if (isPartiallyOrCorrectAnswer && hasTimedOut) {
      return 'timedout';
    }
    return result;

  },

  match(answer, solution) {

    let result = 'not-implemented';

    const answerValue = answer.get('value');
    const answerTimeout = answer.get('timeout');
    const solutionValue = solution.value;
    const solutionScoring = solution.scoring;

    if (solution.type === 'QRU') {
      result = 'not-implemented';
    }

    if (solution.type === 'QCU') {
      result = (answerValue === solutionValue) ? 'ok' : 'ko';
    }

    if (solution.type === 'QCM') {
      result = solutionServiceQcm.match(answerValue, solutionValue);
    }

    if (solution.type === 'QROC') {
      result = solutionServiceQroc.match(answerValue, solutionValue);
    }

    if (solution.type === 'QROCM-ind') {
      result = solutionServiceQrocmInd.match(answerValue, solutionValue);
    }

    if (solution.type === 'QROCM-dep') {
      result = solutionServiceQrocmDep.match(answerValue, solutionValue, solutionScoring);
    }

    if ('#ABAND#' === answerValue) {
      result = 'aband';
    }

    result = this._timedOut(result, answerTimeout);

    return result;
  }

};
