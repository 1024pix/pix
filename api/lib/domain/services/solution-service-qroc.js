const utils = require('./solution-service-utils');
const deactivationsService = require('./deactivations-service');
const _ = require('../../infrastructure/utils/lodash-utils');
const { t1, t2, applyPreTreatments } = require('./validation-treatments');

function _applyPreTreatmentsToSolutions(solution) {
  return _.chain(solution)
    .split('\n')
    .reject(_.isEmpty)
    .value();
}

function _applyTreatmentsToSolutions(solution, deactivations) {
  const pretreatedSolutions = _applyPreTreatmentsToSolutions(solution);
  return _.map(pretreatedSolutions, (pretreatedSolution) => {

    if (deactivationsService.isDefault(deactivations)) {
      return t2(t1(pretreatedSolution));
    }
    else if (deactivationsService.hasOnlyT1(deactivations)) {
      return t2(pretreatedSolution);
    }
    else if (deactivationsService.hasOnlyT2(deactivations)) {
      return t1(pretreatedSolution);
    }
    else if (deactivationsService.hasOnlyT3(deactivations)) {
      return t2(t1(pretreatedSolution));
    }
    else if (deactivationsService.hasOnlyT1T2(deactivations)) {
      return pretreatedSolution;
    }
    else if (deactivationsService.hasOnlyT1T3(deactivations)) {
      return t2(pretreatedSolution);
    }
    else if (deactivationsService.hasOnlyT2T3(deactivations)) {
      return t1(pretreatedSolution);
    }
    else if (deactivationsService.hasT1T2T3(deactivations)) {
      return pretreatedSolution;
    }
  });
}

function _formatResult(validations, deactivations) {

  if (deactivationsService.isDefault(deactivations)) {
    if (validations.t1t2t3Ratio <= 0.25) {
      return 'ok';
    }
    return 'ko';
  }
  else if (deactivationsService.hasOnlyT1(deactivations)) {
    if (validations.t2t3Ratio <= 0.25) {
      return 'ok';
    }
    return 'ko';
  }
  else if (deactivationsService.hasOnlyT2(deactivations)) {
    if (validations.t1t3Ratio <= 0.25) {
      return 'ok';
    }
    return 'ko';
  }
  else if (deactivationsService.hasOnlyT3(deactivations)) {
    if (_.includes(validations.adminAnswers, validations.t1t2)) {
      return 'ok';
    }
    return 'ko';
  }
  else if (deactivationsService.hasOnlyT1T2(deactivations)) {
    if (validations.t3Ratio <= 0.25) {
      return 'ok';
    }
    return 'ko';
  }
  else if (deactivationsService.hasOnlyT1T3(deactivations)) {
    if (_.includes(validations.adminAnswers, validations.t2)) {
      return 'ok';
    }
    return 'ko';
  }
  else if (deactivationsService.hasOnlyT2T3(deactivations)) {
    if (_.includes(validations.adminAnswers, validations.t1)) {
      return 'ok';
    }
    return 'ko';
  }
  else if (deactivationsService.hasT1T2T3(deactivations)) {
    if (_.includes(validations.adminAnswers, validations.userAnswer)) {
      return 'ok';
    }
    return 'ko';
  }
}

module.exports = {

  match(answer, solution, deactivations) {

    // Input checking
    if (!_.isString(answer)
      || !_.isString(solution)
      || _.isEmpty(solution)) {
      return 'ko';
    }

    const treatedAnswer = applyPreTreatments(answer);
    const treatedSolutions = _applyTreatmentsToSolutions(solution, deactivations);

    const validations = utils.treatmentT1T2T3(treatedAnswer, treatedSolutions);

    return _formatResult(validations, deactivations);
  }
};
