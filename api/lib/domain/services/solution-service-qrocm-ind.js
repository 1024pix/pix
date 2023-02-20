import jsYaml from 'js-yaml';
import levenshtein from 'fast-levenshtein';
import _ from '../../infrastructure/utils/lodash-utils';
import logger from '../../infrastructure/logger';
import { applyPreTreatments, applyTreatments } from './validation-treatments';
import { YamlParsingError } from '../../domain/errors';
import { LEVENSHTEIN_DISTANCE_MAX_RATE } from '../constants';
import { useLevenshteinRatio } from './services-utils';
import AnswerStatus from '../models/AnswerStatus';

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

function _areApproximatelyEqualAccordingToLevenshteinDistanceRatio(answer, solutionVariants) {
  let smallestLevenshteinDistance = answer.length;
  solutionVariants.forEach((variant) => {
    const levenshteinDistance = levenshtein.get(answer, variant);
    smallestLevenshteinDistance = Math.min(smallestLevenshteinDistance, levenshteinDistance);
  });
  const ratio = smallestLevenshteinDistance / answer.length;
  return ratio <= LEVENSHTEIN_DISTANCE_MAX_RATE;
}

function _compareAnswersAndSolutions(answers, solutions, enabledTreatments, qrocBlocksTypes = {}) {
  const results = {};
  _.map(answers, (answer, answerKey) => {
    const solutionVariants = solutions[answerKey];
    if (!solutionVariants) {
      logger.warn(
        `[ERREUR CLE ANSWER] La clé ${answerKey} n'existe pas. Première clé de l'épreuve : ${Object.keys(solutions)[0]}`
      );
      throw new YamlParsingError();
    }
    if (useLevenshteinRatio(enabledTreatments) && qrocBlocksTypes[answerKey] != 'select') {
      results[answerKey] = _areApproximatelyEqualAccordingToLevenshteinDistanceRatio(answer, solutionVariants);
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

export default {
  _applyTreatmentsToSolutions,
  _applyTreatmentsToAnswers,
  _compareAnswersAndSolutions,
  _formatResult,

  match({ answerValue, solution }) {
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
    } catch (error) {
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
      qrocBlocksTypes
    );

    // Restitution
    return {
      result: _formatResult(resultDetails),
      resultDetails: resultDetails,
    };
  },
};
