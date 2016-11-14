'use strict';

const solutionServiceQcu = require('./solution-service-qcu');
const solutionServiceQcm = require('./solution-service-qcm');



module.exports = {

  match (answer, solution) {

    const answerValue = answer.get('value');
    const solutionValue = solution.value;

    if ('#ABAND#' === answerValue) {
      return 'aband';
    }

    if (solution.type === 'QCU') {
      return solutionServiceQcu.match (answerValue, solutionValue);
    }

    if (solution.type === 'QCM') {
      return solutionServiceQcm.match (answerValue, solutionValue);
    }

    return 'pending';
  }

};
