const jsYaml = require('js-yaml');
const _ = require('../../infrastructure/utils/lodash-utils');
const utils = require('./solution-service-utils');
const deactivationsService = require('./deactivations-service');

function _applyTreatmentsToSolutions(solutions, deactivations) {
  return _.mapValues(solutions, (validSolutions) => {
    return _.map(validSolutions, (validSolution) => {

      if (deactivationsService.isDefault(deactivations)) {
        return utils._treatmentT2(utils._treatmentT1(validSolution));
      }
      else if (deactivationsService.hasOnlyT1(deactivations)) {
        return utils._treatmentT2(validSolution);
      }
      else if (deactivationsService.hasOnlyT2(deactivations)) {
        return utils._treatmentT1(validSolution);
      }
      else if (deactivationsService.hasOnlyT3(deactivations)) {
        return utils._treatmentT2(utils._treatmentT1(validSolution));
      }
      else if (deactivationsService.hasOnlyT1T2(deactivations)) {
        return validSolution;
      }
      else if (deactivationsService.hasOnlyT1T3(deactivations)) {
        return utils._treatmentT2(validSolution);
      }
      else if (deactivationsService.hasOnlyT2T3(deactivations)) {
        return utils._treatmentT1(validSolution);
      }
      else if (deactivationsService.hasT1T2T3(deactivations)) {
        return validSolution;
      }

    });
  });
}

function _applyTreatmentsToAnswers(answers) {
  return _.mapValues(answers, _.toString);
}


function _calculateResult(validations, deactivations) {
  let result = 'ok';

  _.each(validations, (validation) => {

    if (deactivationsService.isDefault(deactivations)) {
      if (validation.t1t2t3Ratio > 0.25) {
        result = 'ko';
      }
    }
    else if (deactivationsService.hasOnlyT1(deactivations)) {
      if (validation.t2t3Ratio > 0.25) {
        result = 'ko';
      }
    }
    else if (deactivationsService.hasOnlyT2(deactivations)) {
      if (validation.t1t3Ratio > 0.25) {
        result = 'ko';
      }
    }
    else if (deactivationsService.hasOnlyT3(deactivations)) {
      if (!_.includes(validation.adminAnswers, validation.t1t2)) {
        result = 'ko';
      }
    }
    else if (deactivationsService.hasOnlyT1T2(deactivations)) {
      if (validation.t3Ratio > 0.25) {
        result = 'ko';
      }
    }
    else if (deactivationsService.hasOnlyT1T3(deactivations)) {
      if (!_.includes(validation.adminAnswers, validation.t2)) {
        result = 'ko';
      }
    }
    else if (deactivationsService.hasOnlyT2T3(deactivations)) {
      if (!_.includes(validation.adminAnswers, validation.t1)) {
        result = 'ko';
      }
    }
    else if (deactivationsService.hasT1T2T3(deactivations)) {
      if (!_.includes(validation.adminAnswers, validation.userAnswer)) {
        result = 'ko';
      }
    }

  });

  return result;
}

function _applyPreTreatmentsToAnswer(yamlAnswer) {
  return yamlAnswer.replace(/\u00A0/g, ' ');
}


module.exports = {

  match (yamlAnswer, yamlSolution, deactivations) {

    if (_.isNotString(yamlAnswer)
        || _.isNotString(yamlSolution)
        || _.isEmpty(yamlSolution)
        || !_.includes(yamlSolution, '\n')) {
      return 'ko';
    }

    // Pre-Treatments
    const preTreatedAnswers = _applyPreTreatmentsToAnswer(yamlAnswer);

    // and convert YAML to JSObject
    const answers = jsYaml.safeLoad(preTreatedAnswers);
    const solutions = jsYaml.safeLoad(yamlSolution);

    // Treatments
    const treatedSolutions = _applyTreatmentsToSolutions(solutions, deactivations);
    const treatedAnswers = _applyTreatmentsToAnswers(answers);

    //Comparison
    const validations = _.map(treatedAnswers, function(answer, keyAnswer) {
      const solutionsToAnswer = treatedSolutions[keyAnswer];
      const strSolutionsToAnswer = _.map(solutionsToAnswer, _.toString);
      const result = utils.treatmentT1T2T3(answer, strSolutionsToAnswer);
      return result;
    });

    //Restitution
    return _calculateResult(validations, deactivations);

  }

};
