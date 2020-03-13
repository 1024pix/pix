const jsYaml = require('js-yaml');
const _ = require('../../infrastructure/utils/lodash-utils');
const utils = require('./solution-service-utils');
const deactivationsService = require('./deactivations-service');
const { normalizeAndRemoveAccents: t1, removeSpecialCharacters: t2, applyPreTreatments } = require('./validation-treatments');

const AnswerStatus = require('../models/AnswerStatus');

function _applyTreatmentsToSolutions(solutions, deactivations) {
  return _.mapValues(solutions, (validSolutions) => {
    return _.map(validSolutions, (validSolution) => {
      const pretreatedSolution = validSolution.toString();

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
      else if (deactivationsService.hasT1T2T3(deactivations)) {
        return pretreatedSolution;
      }
    });
  });
}

function _applyTreatmentsToAnswers(answers) {
  return _.mapValues(answers, _.toString);
}

function _compareAnswersAndSolutions(answers, solutions) {

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

function _formatResult(scoring, validations, deactivations) {
  let result = AnswerStatus.OK;

  const numberOfGoodAnswers = _numberOfGoodAnswers(validations, deactivations);

  if (_.isEmpty(scoring) && numberOfGoodAnswers !== _.size(validations)) {
    result = AnswerStatus.KO;
  } else if (_.isEmpty(scoring) && numberOfGoodAnswers === _.size(validations)) {
    result = AnswerStatus.OK;
  } else {

    const minGrade = _.min(Object.keys(scoring));
    const maxGrade = _.max(Object.keys(scoring));

    if (numberOfGoodAnswers >= maxGrade) {
      result = AnswerStatus.OK;
    } else if (numberOfGoodAnswers >= minGrade) {
      result = AnswerStatus.PARTIALLY;
    } else {
      result = AnswerStatus.KO;
    }
  }
  return result;
}

module.exports = {

  match(yamlAnswer, yamlSolution, yamlScoring, deactivations) {

    // Input checking
    if (!_.isString(yamlAnswer)
        || _.isEmpty(yamlAnswer)
        || !_.includes(yamlSolution, '\n')) {
      return AnswerStatus.KO;
    }

    // Pre-Treatments
    const preTreatedAnswers = applyPreTreatments(yamlAnswer);

    // Convert Yaml to JS objects
    const answers = jsYaml.safeLoad(preTreatedAnswers, { schema: jsYaml.FAILSAFE_SCHEMA });
    const solutions = jsYaml.safeLoad(yamlSolution, { schema: jsYaml.FAILSAFE_SCHEMA });
    const scoring = jsYaml.safeLoad(yamlScoring || '', { schema: jsYaml.FAILSAFE_SCHEMA });

    // Treatments
    const treatedSolutions = _applyTreatmentsToSolutions(solutions, deactivations);
    const treatedAnswers = _applyTreatmentsToAnswers(answers);

    // Comparisons
    const fullValidations = _compareAnswersAndSolutions(treatedAnswers, treatedSolutions);

    return _formatResult(scoring, fullValidations, deactivations);
  }

};
