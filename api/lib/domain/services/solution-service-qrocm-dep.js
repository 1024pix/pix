/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
const jsYaml = require('js-yaml');
const _ = require('../../infrastructure/utils/lodash-utils');
const utils = require('./solution-service-utils');
const deactivationsService = require('./deactivations-service');


function _applyTreatmentsToSolutions(solutions, deactivations) {
  return _.mapValues(solutions, (validSolutions) => {
    return _.map(validSolutions, (validSolution) => {
      const pretreatedSolution = validSolution.toString();

      if (deactivationsService.isDefault(deactivations)) {
        return utils._treatmentT2(utils._treatmentT1(pretreatedSolution));
      }
      else if (deactivationsService.hasOnlyT1(deactivations)) {
        return utils._treatmentT2(pretreatedSolution);
      }
      else if (deactivationsService.hasOnlyT2(deactivations)) {
        return utils._treatmentT1(pretreatedSolution);
      }
      else if (deactivationsService.hasOnlyT3(deactivations)) {
        return utils._treatmentT2(utils._treatmentT1(pretreatedSolution));
      }
      else if (deactivationsService.hasOnlyT1T2(deactivations)) {
        return pretreatedSolution;
      }
      else if (deactivationsService.hasOnlyT1T3(deactivations)) {
        return utils._treatmentT2(pretreatedSolution);
      }
      else if (deactivationsService.hasT1T2T3(deactivations)) {
        return pretreatedSolution;
      }
    });
  });
}


function _applyTreatmentsToAnswers(answers) {
  return _.mapValues(answers, _.toString);
}


function _calculateValidation(answers, solutions) {

  const validations = {};

  _.each(answers, (answer, index) => {

    const indexation = answer + '_' + index;
    const solutionKeys = Object.keys(solutions);

    _.each(solutionKeys, (solutionKey) => {

      const solutionVariants = solutions[solutionKey];

      if (_.isUndefined(validations[indexation])) {
        validations[indexation] = [];
      }

      validations[indexation].push(utils.treatmentT1T2T3(answer, solutionVariants));

    });
  });
  return validations;
}

function _numberOfGoodAnswers(fullValidations, deactivations) {
  const allGoodAnswers = _goodAnswers(fullValidations, deactivations);
  const uniqGoodAnswers = _.uniqBy(allGoodAnswers, 'adminAnswers');
  return uniqGoodAnswers.length;
}

function _goodAnswers(fullValidations, deactivations) {
  return _.chain(fullValidations)
          .map((fullValidation) => {return _goodAnswer(fullValidation, deactivations);})
          .filter((e) => e !== null)
          .value();
}

// the lowest t1t2t3 ratio is below 0.25
function _goodAnswer(allValidations, deactivations) {
  const bestAnswerSoFar = _.minBy(allValidations, (oneValidation) => oneValidation.t1t2t3Ratio);
  if (deactivationsService.isDefault(deactivations)) {
    return bestAnswerSoFar.t1t2t3Ratio <= 0.25 ? bestAnswerSoFar : null;
  }
  else if (deactivationsService.hasOnlyT1(deactivations)) {
    return bestAnswerSoFar.t2t3Ratio <= 0.25 ? bestAnswerSoFar : null;
  }
  else if (deactivationsService.hasOnlyT2(deactivations)) {
    return bestAnswerSoFar.t1t3Ratio <= 0.25 ? bestAnswerSoFar : null;
  }
  else if (deactivationsService.hasOnlyT3(deactivations)) {
    return _.includes(bestAnswerSoFar.adminAnswers, bestAnswerSoFar.t1t2) ? bestAnswerSoFar : null;
  }
  else if (deactivationsService.hasOnlyT1T2(deactivations)) {
    return bestAnswerSoFar.t3Ratio <= 0.25 ? bestAnswerSoFar : null;
  }
  else if (deactivationsService.hasOnlyT1T3(deactivations)) {
    return _.includes(bestAnswerSoFar.adminAnswers, bestAnswerSoFar.t2) ? bestAnswerSoFar : null;
  }
  else if (deactivationsService.hasT1T2T3(deactivations)) {
    return _.includes(bestAnswerSoFar.adminAnswers, bestAnswerSoFar.userAnswer) ? bestAnswerSoFar : null;
  }
}

function _calculateResult(scoring, validations, deactivations) {
  let result = 'ok';

  const numberOfGoodAnswers = _numberOfGoodAnswers(validations, deactivations);

  if (_.isEmpty(scoring) && numberOfGoodAnswers !== _.size(validations)) {
    result = 'ko';
  } else if (_.isEmpty(scoring) && numberOfGoodAnswers === _.size(validations)) {
    result = 'ok';
  } else {

    const minGrade = _.min(Object.keys(scoring));
    const maxGrade = _.max(Object.keys(scoring));

    if (numberOfGoodAnswers >= maxGrade) {
      result = 'ok';
    } else if (numberOfGoodAnswers >= minGrade) {
      result = 'partially';
    } else {
      result = 'ko';
    }
  }
  return result;
}

function _applyPreTreatmentsToAnswer(yamlAnswer) {
  return yamlAnswer.replace(/\u00A0/g, ' ');
}

module.exports = {
  match(yamlAnswer, yamlSolution, yamlScoring, deactivations) {

    // Validate inputs
    if (_.isNotString(yamlAnswer)
        || _.isNotString(yamlSolution)
        || _.isEmpty(yamlAnswer)
        || !_.includes(yamlSolution, '\n')) {
      return 'ko';
    }

    // Pre-Treatments
    const preTreatedAnswers = _applyPreTreatmentsToAnswer(yamlAnswer);

    // remove unbreakable spaces
    // Convert Yaml to JS objects
    const answers = jsYaml.safeLoad(preTreatedAnswers);
    const solutions = jsYaml.safeLoad(yamlSolution);
    const scoring = jsYaml.safeLoad(_.ensureString(yamlScoring));


    // Treatments
    const treatedSolutions = _applyTreatmentsToSolutions(solutions, deactivations);
    const treatedAnswers = _applyTreatmentsToAnswers(answers);

    // Comparisons
    const fullValidations = _calculateValidation(treatedAnswers, treatedSolutions);

    return _calculateResult(scoring, fullValidations, deactivations);
  }

};
