import jsYaml from 'js-yaml';
import { applyPreTreatments, applyTreatments } from './validation-treatments.js';
import { YamlParsingError } from '../../domain/errors.js';
import { getEnabledTreatments, useLevenshteinRatio } from './services-utils.js';
import { validateAnswer } from './string-comparison-service.js';
import { AnswerStatus } from '../../../src/school/domain/models/AnswerStatus.js';

function applyTreatmentsToSolutions(solutions, enabledTreatments) {
  return Object.fromEntries(
    Object.entries(solutions).map(([solutionKey, acceptedSolutions]) => [
      solutionKey,
      acceptedSolutions.map((acceptedSolution) => applyTreatments(acceptedSolution.toString(), enabledTreatments)),
    ]),
  );
}

function applyTreatmentsToAnswers(answers, enabledTreatments) {
  return Object.fromEntries(
    Object.entries(answers).map(([key, answer]) => [key, applyTreatments(answer.toString(), enabledTreatments)]),
  );
}

function getNumberOfGoodAnswers(treatedAnswers, treatedSolutions, enabledTreatments, solutions) {
  return getCorrectionDetails(treatedAnswers, treatedSolutions, enabledTreatments, solutions).answersEvaluation.filter(
    Boolean,
  ).length;
}

function getSolutionsWithoutGoodAnswers(remainingUnmatchedSolutions) {
  return Object.values(remainingUnmatchedSolutions).map((availableSolutions) => availableSolutions[0]);
}

function getCorrectionDetails(treatedAnswers, treatedSolutions, enabledTreatments, solutions) {
  const remainingUnmatchedSolutions = new Map(Object.entries(treatedSolutions));

  const answersEvaluation = Object.values(treatedAnswers).map((answer) => {
    for (const [solutionKey, acceptedSolutions] of remainingUnmatchedSolutions) {
      const status = validateAnswer(answer, acceptedSolutions, useLevenshteinRatio(enabledTreatments));
      if (status) {
        remainingUnmatchedSolutions.delete(solutionKey);
        delete solutions[solutionKey];
        return true;
      }
    }
    return false;
  });

  return {
    answersEvaluation,
    solutionsWithoutGoodAnswers: answersEvaluation.every(Boolean) ? [] : getSolutionsWithoutGoodAnswers(solutions),
  };
}

function convertYamlToJsObjects(preTreatedAnswers, yamlSolution) {
  let answers, solutions;
  try {
    answers = jsYaml.load(preTreatedAnswers, { schema: jsYaml.FAILSAFE_SCHEMA });
    solutions = jsYaml.load(yamlSolution, { schema: jsYaml.FAILSAFE_SCHEMA });
  } catch (error) {
    throw new YamlParsingError();
  }
  return { answers, solutions };
}

function treatAnswersAndSolutions(deactivations, solutions, answers) {
  const enabledTreatments = getEnabledTreatments(true, deactivations);
  const treatedSolutions = applyTreatmentsToSolutions(solutions, enabledTreatments);
  const treatedAnswers = applyTreatmentsToAnswers(answers, enabledTreatments);
  return { enabledTreatments, treatedSolutions, treatedAnswers };
}

const match = function ({
  answerValue,
  solution: { deactivations, value: yamlSolution },

  dependencies = {
    applyPreTreatments,
    convertYamlToJsObjects,
    treatAnswersAndSolutions,
  },
}) {
  // Input checking
  if (typeof answerValue !== 'string' || !answerValue.length || !String(yamlSolution).includes('\n')) {
    return AnswerStatus.KO;
  }

  // Pre-Treatments
  const preTreatedAnswers = dependencies.applyPreTreatments(answerValue);
  const { answers, solutions } = dependencies.convertYamlToJsObjects(preTreatedAnswers, yamlSolution);
  const { enabledTreatments, treatedSolutions, treatedAnswers } = dependencies.treatAnswersAndSolutions(
    deactivations,
    solutions,
    answers,
  );
  const numberOfGoodAnswers = getNumberOfGoodAnswers(treatedAnswers, treatedSolutions, enabledTreatments, solutions);

  return numberOfGoodAnswers === Object.keys(answers).length ? AnswerStatus.OK : AnswerStatus.KO;
};

const getCorrection = function ({
  answerValue,
  solution: { deactivations, value: yamlSolution },

  dependencies = {
    applyPreTreatments,
    convertYamlToJsObjects,
    treatAnswersAndSolutions,
  },
}) {
  // Pre-Treatments
  const preTreatedAnswers = dependencies.applyPreTreatments(answerValue);
  const { answers, solutions } = dependencies.convertYamlToJsObjects(preTreatedAnswers, yamlSolution);
  const { enabledTreatments, treatedSolutions, treatedAnswers } = dependencies.treatAnswersAndSolutions(
    deactivations,
    solutions,
    answers,
  );

  return getCorrectionDetails(treatedAnswers, treatedSolutions, enabledTreatments, solutions);
};

export { match, getCorrection, getCorrectionDetails };
