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
  let solutionsNotFound = _.clone(treatedSolutions);

  return _.reduce(
    treatedAnswers,
    (goodAnswerNb, answer) => {
      let result = goodAnswerNb;

      const solutionKey = _.findKey(solutionsNotFound, (solutionList) => {
        return validateAnswer(answer, solutionList, useLevenshteinRatio(enabledTreatments));
      });

      if (solutionKey) {
        solutionsNotFound = _.omit(solutionsNotFound, solutionKey);
        result += 1;
      }

      return result;
    },
    0
  );
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
};
