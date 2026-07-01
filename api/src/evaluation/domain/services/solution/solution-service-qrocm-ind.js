import jsYaml from 'js-yaml';

import { YamlParsingError } from '../../../../shared/domain/errors.js';
import { AnswerStatus } from '../../../../shared/domain/models/AnswerStatus.js';
import { isCloseEnoughToOneOf } from '../../../../shared/domain/services/string-similarity-service.js';
import { _ } from '../../../../shared/infrastructure/utils/lodash-utils.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { useLevenshteinRatio } from '../services-utils.js';
import { applyPreTreatments, applyTreatments } from '../validation-treatments.js';

function _applyTreatmentsToSolutions(solutions, enabledTreatments, qrocBlocksTypes = {}) {
  return _.forEach(solutions, (solution, solutionKey) => {
    solution.forEach((variant, variantIndex) => {
      if (qrocBlocksTypes[solutionKey] === 'select') {
        solutions[solutionKey][variantIndex] = applyTreatments(variant, []);
      } else {
        solutions[solutionKey][variantIndex] = applyTreatments(variant, enabledTreatments);
      }
    });
  });
}

function _applyTreatmentsToAnswers(answers, enabledTreatments, qrocBlocksTypes = {}) {
  return _.forEach(answers, (answer, answerKey) => {
    if (qrocBlocksTypes[answerKey] === 'select') {
      answers[answerKey] = applyTreatments(answer, []);
    } else {
      answers[answerKey] = applyTreatments(answer, enabledTreatments);
    }
  });
}

function _compareAnswersAndSolutions(answers, solutions, enabledTreatments, qrocBlocksTypes = {}) {
  const results = {};
  _.map(answers, (answer, answerKey) => {
    const solutionVariants = solutions[answerKey];
    if (!solutionVariants) {
      logger.warn({
        event: 'badly_formatted_challenge',
        message: `La clé ${answerKey} n'existe pas. Première clé de l'épreuve : ${Object.keys(solutions)[0]}`,
      });
      throw new YamlParsingError();
    }
    if (useLevenshteinRatio(enabledTreatments) && qrocBlocksTypes[answerKey] != 'select') {
      results[answerKey] = isCloseEnoughToOneOf(answer, solutionVariants);
    } else if (solutionVariants) {
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

function match({ answerValue, solution }) {
  const yamlSolution = solution.value;
  const enabledTreatments = solution.enabledTreatments;
  const qrocBlocksTypes = solution.qrocBlocksTypes || {};

  // Input checking
  if (!_.isString(answerValue) || _.isEmpty(yamlSolution) || !_.includes(yamlSolution, '\n')) {
    return { result: AnswerStatus.KO };
  }

  // Pre-treatments
  const preTreatedAnswers = applyPreTreatments(answerValue);
  const preTreatedSolutions = applyPreTreatments(yamlSolution);

  // Convert YAML to JSObject
  let answers, solutions;

  try {
    answers = jsYaml.load(preTreatedAnswers, { schema: jsYaml.FAILSAFE_SCHEMA });
    solutions = jsYaml.load(preTreatedSolutions, { schema: jsYaml.FAILSAFE_SCHEMA });
  } catch {
    throw new YamlParsingError();
  }

  // Treatments
  const treatedSolutions = _applyTreatmentsToSolutions(solutions, enabledTreatments, qrocBlocksTypes);
  const treatedAnswers = _applyTreatmentsToAnswers(answers, enabledTreatments, qrocBlocksTypes);

  // Comparison
  const resultDetails = _compareAnswersAndSolutions(
    treatedAnswers,
    treatedSolutions,
    enabledTreatments,
    qrocBlocksTypes,
  );

  // Restitution
  return {
    result: _formatResult(resultDetails),
    resultDetails: resultDetails,
  };
}

export { _applyTreatmentsToAnswers, _applyTreatmentsToSolutions, _compareAnswersAndSolutions, _formatResult, match };
