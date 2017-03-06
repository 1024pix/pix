const Answer = require('../../domain/models/data/answer');
const Boom = require('boom');
const _ = require('../../infrastructure/utils/lodash-utils');

const solutionServiceQcm = require('./solution-service-qcm');
const solutionServiceQcu = require('./solution-service-qcu');
const solutionServiceQru = require('./solution-service-qru');
const solutionServiceQroc = require('./solution-service-qroc');
const solutionServiceQrocmInd = require('./solution-service-qrocm-ind');
const solutionServiceQrocmDep = require('./solution-service-qrocm-dep');
const solutionRepository = require('../../infrastructure/repositories/solution-repository');

module.exports = {

  revalidate(existingAnswer) {
    return new Promise((resolve, reject) => {
      const currentResult = existingAnswer.get('result');
      if (currentResult === 'timedout' || currentResult === 'aband') {
        resolve(existingAnswer);
      } else {
        solutionRepository
        .get(existingAnswer.get('challengeId'))
        .then((solution) => {
          const answerCorrectness = this.match(existingAnswer, solution);
          new Answer({ id: existingAnswer.id, result: answerCorrectness })
              .save()
              .then((updatedAnswer) => resolve(updatedAnswer))
              .catch((err) => reject(Boom.badImplementation(err)));
        });
      }
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

  match(answer, solution) {

    let result = 'unimplemented';

    const answerValue = answer.get('value');
    const answerTimeout = answer.get('timeout');
    const solutionValue = solution.value;
    const solutionScoring = solution.scoring;
    const deactivations = solution.deactivations;

    if ('#ABAND#' === answerValue) {
      return 'aband';
    }

    if (solution.type === 'QRU') {
      result = solutionServiceQru.match(answerValue, solutionValue);
    }

    if (solution.type === 'QCU') {
      result = solutionServiceQcu.match(answerValue, solutionValue);
    }

    if (solution.type === 'QCM') {
      result = solutionServiceQcm.match(answerValue, solutionValue);
    }

    if (solution.type === 'QROC') {
      result = solutionServiceQroc.match(answerValue, solutionValue, deactivations);
    }

    if (solution.type === 'QROCM-ind') {
      result = solutionServiceQrocmInd.match(answerValue, solutionValue, deactivations);
    }

    if (solution.type === 'QROCM-dep') {
      result = solutionServiceQrocmDep.match(answerValue, solutionValue, solutionScoring, deactivations);
    }

    if (answerTimeout) {
      result = this._timedOut(result, answerTimeout);
    }

    return result;
  }

};
