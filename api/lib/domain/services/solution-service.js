const Answer = require('../../domain/models/data/answer');
const _ = require('../../infrastructure/utils/lodash-utils');

const solutionServiceQcm = require('./solution-service-qcm');
const solutionServiceQcu = require('./solution-service-qcu');
const solutionServiceQroc = require('./solution-service-qroc');
const solutionServiceQrocmInd = require('./solution-service-qrocm-ind');
const solutionServiceQrocmDep = require('./solution-service-qrocm-dep');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');

module.exports = {

  revalidate(existingAnswer) {
    const currentResult = existingAnswer.get('result');
    if (currentResult === 'timedout' || currentResult === 'aband') {
      return Promise.resolve(existingAnswer);
    }
    return solutionRepository
      .get(existingAnswer.get('challengeId'))
      .then((solution) => {
        const answerCorrectness = this.validate(existingAnswer, solution);
        return new Answer({
          id: existingAnswer.id,
          result: answerCorrectness.result,
          resultDetails: answerCorrectness.resultDetails
        }).save();
      });
  },

  _timedOut(result, answerTimeout) {
    const isPartiallyOrCorrectAnswer = (result === 'ok' || result === 'partially');
    const hasTimedOut = _.isInteger(answerTimeout) && answerTimeout < 0;

    if (isPartiallyOrCorrectAnswer && hasTimedOut) {
      return 'timedout';
    }
    return result;
  },

  validate(answer, solution) {

    let response = {
      result: 'unimplemented',
      resultDetails: null
    };

    const answerValue = answer.get('value');
    const answerTimeout = answer.get('timeout');
    const solutionValue = solution.value;
    const solutionScoring = solution.scoring;
    const enabledTreatments = solution.enabledTreatments;
    const deactivations = solution.deactivations;

    if ('#ABAND#' === answerValue) {
      response.result = 'aband';
      return response;
    }

    switch (solution.type) {
      case 'QCU':
        response.result = solutionServiceQcu.match(answerValue, solutionValue);
        break;
      case 'QCM':
        response.result = solutionServiceQcm.match(answerValue, solutionValue);
        break;
      case 'QROC':
        response.result = solutionServiceQroc.match(answerValue, solutionValue, deactivations);
        break;
      case 'QROCM-ind':
        response = solutionServiceQrocmInd.match(answerValue, solutionValue, enabledTreatments);
        break;
      case 'QROCM-dep':
        response.result = solutionServiceQrocmDep.match(answerValue, solutionValue, solutionScoring, deactivations);
        break;
    }

    if (answerTimeout) {
      response.result = this._timedOut(response.result, answerTimeout);
    }

    return response;
  }

};
