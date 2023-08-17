import jsYaml from 'js-yaml';

import { YamlParsingError } from '../../domain/errors.js';
import { AnswerStatus } from '../models/AnswerStatus.js';
import { Validation } from '../models/index.js';
import { getEnabledTreatments, useLevenshteinRatio } from './services-utils.js';
import { validateAnswer } from './string-comparison-service.js';
import { applyPreTreatments, applyTreatments } from './validation-treatments.js';

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

function getAnswerStatus(scoring, numberOfGoodAnswers, nbOfAnswers) {
  if (!scoring || Object.keys(scoring).length === 0) {
    return numberOfGoodAnswers === nbOfAnswers ? AnswerStatus.OK : AnswerStatus.KO;
  } else {
    const grades = Object.keys(scoring).map((grade) => Number(grade));
    const minGrade = Math.min(...grades);
    const maxGrade = Math.max(...grades);

    if (numberOfGoodAnswers >= maxGrade) {
      return AnswerStatus.OK;
    } else if (numberOfGoodAnswers >= minGrade) {
      return AnswerStatus.PARTIALLY;
    } else {
      return AnswerStatus.KO;
    }
  }
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

function convertYamlToJsObjects(preTreatedAnswers, yamlSolution, yamlScoring) {
  let answers, solutions, scoring;
  try {
    answers = jsYaml.load(preTreatedAnswers, { schema: jsYaml.FAILSAFE_SCHEMA });
    solutions = jsYaml.load(yamlSolution, { schema: jsYaml.FAILSAFE_SCHEMA });
    scoring = jsYaml.load(yamlScoring || '', { schema: jsYaml.FAILSAFE_SCHEMA });
  } catch (error) {
    throw new YamlParsingError();
  }
  return { answers, solutions, scoring };
}

function treatAnswersAndSolutions(deactivations, solutions, answers) {
  const enabledTreatments = getEnabledTreatments(true, deactivations);
  const treatedSolutions = applyTreatmentsToSolutions(solutions, enabledTreatments);
  const treatedAnswers = applyTreatmentsToAnswers(answers, enabledTreatments);
  return { enabledTreatments, treatedSolutions, treatedAnswers };
}

const match = function ({
  answerValue,
  solution: { deactivations, scoring: yamlScoring, value: yamlSolution },
  dependencies = {
    applyPreTreatments,
    convertYamlToJsObjects,
    treatAnswersAndSolutions,
  },
}) {
  // If challenge is skipped, return ko validation
  const properlyFormattedYamlSolution = String(yamlSolution).includes('\n');

  if (typeof answerValue !== 'string' || !answerValue.length || !properlyFormattedYamlSolution) {
    return new Validation({ result: AnswerStatus.KO, resultDetails: null });
  }

  // Pre-Treatments
  const preTreatedAnswers = dependencies.applyPreTreatments(answerValue);
  const { answers, solutions, scoring } = dependencies.convertYamlToJsObjects(
    preTreatedAnswers,
    yamlSolution,
    yamlScoring,
  );
  const { enabledTreatments, treatedSolutions, treatedAnswers } = dependencies.treatAnswersAndSolutions(
    deactivations,
    solutions,
    answers,
  );
  const numberOfGoodAnswers = getNumberOfGoodAnswers(treatedAnswers, treatedSolutions, enabledTreatments, solutions);
  const answerStatus = getAnswerStatus(scoring, numberOfGoodAnswers, Object.keys(answers).length);

  return new Validation({
    result: answerStatus,
    resultDetails:
      answerStatus.status !== AnswerStatus.OK.status
        ? getCorrectionDetails(treatedAnswers, treatedSolutions, enabledTreatments, solutions)
        : null,
  });
};

export { getCorrectionDetails, match };
