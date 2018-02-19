const Answer = require('../../infrastructure/data/answer');
const AnswerStatus = require('../../domain/models/AnswerStatus');
const AnswerStatusJsonApiAdapter = require('../../interfaces/serializer/json-api/AnswerStatusJsonApiAdapter');
const _ = require('../../infrastructure/utils/lodash-utils');

const solutionServiceQcm = require('./solution-service-qcm');
const solutionServiceQcu = require('./solution-service-qcu');
const solutionServiceQroc = require('./solution-service-qroc');
const solutionServiceQrocmInd = require('./solution-service-qrocm-ind');
const solutionServiceQrocmDep = require('./solution-service-qrocm-dep');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');

function _adaptAnswerMatcherToSolutionType(solution, answerValue) {
  switch (solution.type) {
    case 'QCU':
      return solutionServiceQcu.match(answerValue, solution.value);
    case 'QCM':
      return solutionServiceQcm.match(answerValue, solution.value);
    case 'QROC':
      return solutionServiceQroc.match(answerValue, solution.value, solution.deactivations);
    case 'QROCM-ind':
      return solutionServiceQrocmInd.match(answerValue, solution.value, solution.enabledTreatments);
    case 'QROCM-dep':
      return solutionServiceQrocmDep.match(answerValue, solution.value, solution.scoring, solution.deactivations);
    default:
      return AnswerStatus.UNIMPLEMENTED;
  }
}

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
    const isPartiallyOrCorrectAnswer = result.isOK() || result.isPARTIALLY();
    const hasTimedOut = _.isInteger(answerTimeout) && answerTimeout < 0;

    if (isPartiallyOrCorrectAnswer && hasTimedOut) {
      return AnswerStatus.TIMEDOUT;
    }
    return result;
  },

  validate(answer, solution) {

    const answerValue = answer.get('value');
    const answerTimeout = answer.get('timeout');

    let answerStatus;
    let resultDetails = null;

    if (AnswerStatus.isSKIPPED(answerValue)) {
      answerStatus = AnswerStatus.SKIPPED;
    } else {
      answerStatus = _adaptAnswerMatcherToSolutionType(solution, answerValue);
      // FIXME WTF when solution.type === 'QROCM-ind'
      if (answerStatus.resultDetails) {
        resultDetails = answerStatus.resultDetails;
        answerStatus = answerStatus.result;
      }
    }

    if (answerTimeout) {
      answerStatus = this._timedOut(answerStatus, answerTimeout);
    }

    const response = {
      result: null,
      resultDetails: null,
    };

    // TODO: remonter l'appel de l'adaptation dans le controlleur
    response.result = AnswerStatusJsonApiAdapter.adapt(answerStatus);
    response.resultDetails = resultDetails;
    return response;
  }
};
