const jsYaml = require('js-yaml');
const _ = require('../../infrastructure/utils/lodash-utils.js');
const { applyPreTreatments, applyTreatments } = require('./validation-treatments.js');
const { YamlParsingError } = require('../../domain/errors.js');
const { getEnabledTreatments, useLevenshteinRatio } = require('./services-utils.js');
const { validateAnswer } = require('./string-comparison-service.js');

const AnswerStatus = require('../models/AnswerStatus.js');

function applyTreatmentsToSolutions(solutions, enabledTreatments) {
  return _.mapValues(solutions, (validSolutions) => {
    return _.map(validSolutions, (validSolution) => {
      return applyTreatments(validSolution.toString(), enabledTreatments);
    });
  });
}

function applyTreatmentsToAnswers(answers, enabledTreatments) {
  return _.mapValues(answers, (answer) => applyTreatments(answer.toString(), enabledTreatments));
}

function formatResult(scoring, numberOfGoodAnswers, nbOfAnswers) {
  if (_.isEmpty(scoring)) {
    return numberOfGoodAnswers === nbOfAnswers ? AnswerStatus.OK : AnswerStatus.KO;
  } else {
    const minGrade = _.min(Object.keys(scoring));
    const maxGrade = _.max(Object.keys(scoring));

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
  return getAnswersStatuses(treatedAnswers, treatedSolutions, enabledTreatments).filter(({ status }) => status === 'ok')
    .length;
}

function getAnswersStatuses(treatedAnswers, treatedSolutions, enabledTreatments) {
  const unmatchedSolutions = new Map(Object.entries(treatedSolutions));

  return Object.values(treatedAnswers)
    .map((answer) => {
      for (const [solutionGroup, availableSolutions] of unmatchedSolutions) {
        const status = validateAnswer(answer, availableSolutions, useLevenshteinRatio(enabledTreatments));

        if (status) {
          unmatchedSolutions.delete(solutionGroup);

          return { answer, status: 'ok', alternativeSolutions: [] };
        }
      }

      return { answer, status: 'ko' };
    })
    .map((answerAndStatus) => {
      if (answerAndStatus.status === 'ko') {
        const alternativeSolutions = getAlternativeSolutions(unmatchedSolutions);
        return { ...answerAndStatus, alternativeSolutions };
      }

      return answerAndStatus;
    });
}

function getAlternativeSolutions(unmatchedSolutions) {
  return Array.from(unmatchedSolutions.values()).map((availableSolutions) => availableSolutions[0]);
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

module.exports = {
  match({
    answerValue,
    solution,
    dependencies = {
      applyPreTreatments,
      convertYamlToJsObjects,
      getEnabledTreatments,
      applyTreatmentsToSolutions,
      applyTreatmentsToAnswers,
    },
  }) {
    const yamlSolution = solution.value;
    const yamlScoring = solution.scoring;
    const deactivations = solution.deactivations;

    // Input checking
    if (!_.isString(answerValue) || _.isEmpty(answerValue) || !_.includes(yamlSolution, '\n')) {
      return AnswerStatus.KO;
    }

    // Pre-Treatments
    const preTreatedAnswers = dependencies.applyPreTreatments(answerValue);

    const { answers, solutions, scoring } = dependencies.convertYamlToJsObjects(
      preTreatedAnswers,
      yamlSolution,
      yamlScoring
    );

    const enabledTreatments = dependencies.getEnabledTreatments(true, deactivations);

    const treatedSolutions = dependencies.applyTreatmentsToSolutions(solutions, enabledTreatments);
    const treatedAnswers = dependencies.applyTreatmentsToAnswers(answers, enabledTreatments);

    const numberOfGoodAnswers = getNumberOfGoodAnswers(treatedAnswers, treatedSolutions, enabledTreatments);

    return formatResult(scoring, numberOfGoodAnswers, _.size(answers));
  },

  getSolution({
    answerValue,
    solution,
    dependencies = {
      applyPreTreatments,
      convertYamlToJsObjects,
      getEnabledTreatments,
      applyTreatmentsToSolutions,
      applyTreatmentsToAnswers,
    },
  }) {
    const yamlSolution = solution.value;
    const yamlScoring = solution.scoring;
    const deactivations = solution.deactivations;

    // Pre-Treatments
    const preTreatedAnswers = dependencies.applyPreTreatments(answerValue);

    const { answers, solutions } = dependencies.convertYamlToJsObjects(preTreatedAnswers, yamlSolution, yamlScoring);

    const enabledTreatments = dependencies.getEnabledTreatments(true, deactivations);

    const treatedSolutions = dependencies.applyTreatmentsToSolutions(solutions, enabledTreatments);
    const treatedAnswers = dependencies.applyTreatmentsToAnswers(answers, enabledTreatments);

    return getAnswersStatuses(treatedAnswers, treatedSolutions, enabledTreatments);
  },
};
