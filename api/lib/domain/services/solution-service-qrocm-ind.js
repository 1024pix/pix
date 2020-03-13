const jsYaml = require('js-yaml');
const levenshtein = require('fast-levenshtein');
const _ = require('../../infrastructure/utils/lodash-utils');
const { applyPreTreatments, applyTreatments } = require('./validation-treatments');

const AnswerStatus = require('../models/AnswerStatus');

function _applyTreatmentsToSolutions(solutions, enabledTreatments) {
  return _.forEach(solutions, (solution, solutionKey) => {
    solution.forEach((variant, variantIndex) => {
      solutions[solutionKey][variantIndex] = applyTreatments(variant, enabledTreatments);
    });
  });
}

function _applyTreatmentsToAnswers(answers, enabledTreatments) {
  return _.forEach(answers, (answer, answerKey) => {
    answers[answerKey] = applyTreatments(answer, enabledTreatments);
  });
}

function _areApproximatevelyEqualAccordingToLevenshteinDistanceRatio(answer, solutionVariants) {
  let smallestLevenshteinDistance = answer.length;
  solutionVariants.forEach((variant) => {
    const levenshteinDistance = levenshtein.get(answer, variant);
    smallestLevenshteinDistance = Math.min(smallestLevenshteinDistance, levenshteinDistance);
  });
  const ratio = smallestLevenshteinDistance / answer.length;
  return ratio <= 0.25;
}

function _compareAnswersAndSolutions(answers, solutions, enabledTreatments) {
  const results = {};
  _.map(answers, (answer, answerKey) => {
    const solutionVariants = solutions[answerKey];
    if (enabledTreatments.includes('t3')) {
      results[answerKey] = _areApproximatevelyEqualAccordingToLevenshteinDistanceRatio(answer, solutionVariants);
    } else {
      results[answerKey] = solutionVariants.includes(answer);
    }
  });
  return results;
}

function _formatResult(resultDetails) {
  let result = AnswerStatus.OK;
  _.forEach(resultDetails, (resultDetail) => {
    if (!resultDetail) {
      result = AnswerStatus.KO;
    }
  });
  return result;
}

module.exports = {

  _applyTreatmentsToSolutions,
  _applyTreatmentsToAnswers,
  _compareAnswersAndSolutions,
  _formatResult,

  match(yamlAnswer, yamlSolution, enabledTreatments) {

    // Input checking
    if (!_.isString(yamlAnswer)
      || _.isEmpty(yamlSolution)
      || !_.includes(yamlSolution, '\n')) {
      return { result: AnswerStatus.KO };
    }

    // Pre-treatments
    const preTreatedAnswers = applyPreTreatments(yamlAnswer);
    const preTreatedSolutions = applyPreTreatments(yamlSolution);

    // Convert YAML to JSObject
    const answers = jsYaml.safeLoad(preTreatedAnswers, { schema: jsYaml.FAILSAFE_SCHEMA });
    const solutions = jsYaml.safeLoad(preTreatedSolutions, { schema: jsYaml.FAILSAFE_SCHEMA });

    // Treatments
    const treatedSolutions = _applyTreatmentsToSolutions(solutions, enabledTreatments);
    const treatedAnswers = _applyTreatmentsToAnswers(answers, enabledTreatments);

    // Comparison
    const resultDetails = _compareAnswersAndSolutions(treatedAnswers, treatedSolutions, enabledTreatments);

    // Restitution
    return {
      result: _formatResult(resultDetails),
      resultDetails: resultDetails
    };
  }

};
