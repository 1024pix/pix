import jsYaml from 'js-yaml';
import { applyPreTreatments, applyTreatments } from './validation-treatments.js';
import { YamlParsingError } from '../../domain/errors.js';
import { getEnabledTreatments, useLevenshteinRatio } from './services-utils.js';
import { validateAnswer } from './string-comparison-service.js';
import { AnswerStatus } from '../models/AnswerStatus.js';
import { CorrectionBlockQROCMDep } from '../models/CorrectionBlockQROCMDep.js';

function applyTreatmentsToSolutions(solutions, enabledTreatments) {
  return Object.fromEntries(
    Object.entries(solutions).map(([solutionGroup, acceptedSolutions]) => [
      solutionGroup,
      acceptedSolutions.map((acceptedSolution) => applyTreatments(acceptedSolution.toString(), enabledTreatments)),
    ])
  );
}

function applyTreatmentsToAnswers(answers, enabledTreatments) {
  return Object.fromEntries(
    Object.entries(answers).map(([key, answer]) => [key, applyTreatments(answer.toString(), enabledTreatments)])
  );
}

function formatResult(scoring, numberOfGoodAnswers, nbOfAnswers) {
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

function getNumberOfGoodAnswers(treatedAnswers, treatedSolutions, enabledTreatments) {
  return getAnswersStatuses(treatedAnswers, treatedSolutions, enabledTreatments).filter(({ validated }) => validated)
    .length;
}

function getAnswersStatuses(treatedAnswers, treatedSolutions, enabledTreatments) {
  const remainingUnmatchedSolutions = new Map(Object.entries(treatedSolutions));

  return Object.values(treatedAnswers)
    .map((answer) => {
      for (const [solutionGroup, acceptedSolutions] of remainingUnmatchedSolutions) {
        const status = validateAnswer(answer, acceptedSolutions, useLevenshteinRatio(enabledTreatments));

        if (status) {
          remainingUnmatchedSolutions.delete(solutionGroup);

          return new CorrectionBlockQROCMDep(true, []);
        }
      }

      return new CorrectionBlockQROCMDep(false, []);
    })
    .map((correctionBlock) => {
      if (!correctionBlock.validated) {
        correctionBlock.alternativeSolutions = getAlternativeSolutions(remainingUnmatchedSolutions);
        return correctionBlock;
      }

      return correctionBlock;
    });
}

function getAlternativeSolutions(remainingUnmatchedSolutions) {
  return Array.from(remainingUnmatchedSolutions.values()).map((availableSolutions) => availableSolutions[0]);
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
    getEnabledTreatments,
    treatAnswersAndSolutions,
  },
}) {
  // Input checking
  if (typeof answerValue !== 'string' || !answerValue.length || !String(yamlSolution).includes('\n')) {
    return AnswerStatus.KO;
  }

  // Pre-Treatments
  const preTreatedAnswers = dependencies.applyPreTreatments(answerValue);
  const { answers, solutions, scoring } = dependencies.convertYamlToJsObjects(
    preTreatedAnswers,
    yamlSolution,
    yamlScoring
  );
  const { enabledTreatments, treatedSolutions, treatedAnswers } = dependencies.treatAnswersAndSolutions(
    deactivations,
    solutions,
    answers
  );
  const numberOfGoodAnswers = getNumberOfGoodAnswers(treatedAnswers, treatedSolutions, enabledTreatments);

  return formatResult(scoring, numberOfGoodAnswers, Object.keys(answers).length);
};

const getSolution = function ({
  answerValue,
  solution: { deactivations, scoring: yamlScoring, value: yamlSolution },

  dependencies = {
    applyPreTreatments,
    convertYamlToJsObjects,
    treatAnswersAndSolutions,
  },
}) {
  // Pre-Treatments
  const preTreatedAnswers = dependencies.applyPreTreatments(answerValue);
  const { answers, solutions } = dependencies.convertYamlToJsObjects(preTreatedAnswers, yamlSolution, yamlScoring);
  const { enabledTreatments, treatedSolutions, treatedAnswers } = dependencies.treatAnswersAndSolutions(
    deactivations,
    solutions,
    answers
  );

  return getAnswersStatuses(treatedAnswers, treatedSolutions, enabledTreatments);
};

export { match, getSolution };
