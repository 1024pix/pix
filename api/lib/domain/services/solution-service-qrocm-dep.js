const jsYaml = require('js-yaml');
const _ = require('../../infrastructure/utils/lodash-utils');
const { applyPreTreatments, applyTreatments } = require('./validation-treatments');
const { YamlParsingError } = require('../../domain/errors');
const { getEnabledTreatments } = require('./services-utils');
const { validateAnswer } = require('./string-comparison-service');

const AnswerStatus = require('../models/AnswerStatus');

function _applyTreatmentsToSolutions(solutions, enabledTreatments) {
  return _.mapValues(solutions, (validSolutions) => {
    return _.map(validSolutions, (validSolution) => {
      return applyTreatments(validSolution.toString(), enabledTreatments);
    });
  });
}

function _applyTreatmentsToAnswers(answers, enabledTreatments) {
  return _.mapValues(answers, answer => applyTreatments(answer.toString(), enabledTreatments))
}

function _formatResult(scoring, numberOfGoodAnswers, nbOfAnswers) {

  if (_.isEmpty(scoring)) {
    return numberOfGoodAnswers === nbOfAnswers ? AnswerStatus.OK : AnswerStatus.KO ;
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

module.exports = {
  match({ answerValue, solution }) {
    const yamlSolution = solution.value;
    const yamlScoring = solution.scoring;
    const deactivations = solution.deactivations;

    // Input checking
    if (!_.isString(answerValue) || _.isEmpty(answerValue) || !_.includes(yamlSolution, '\n')) {
      return AnswerStatus.KO;
    }

    // Pre-Treatments
    const preTreatedAnswers = applyPreTreatments(answerValue);

    // Convert Yaml to JS objects
    let answers, solutions, scoring;
    try {
      answers = jsYaml.load(preTreatedAnswers, { schema: jsYaml.FAILSAFE_SCHEMA });
      solutions = jsYaml.load(yamlSolution, { schema: jsYaml.FAILSAFE_SCHEMA });
      scoring = jsYaml.load(yamlScoring || '', { schema: jsYaml.FAILSAFE_SCHEMA });
    } catch (error) {
      throw new YamlParsingError();
    }

    const enabledTreatments = getEnabledTreatments(true, deactivations);

    let treatedSolutions = _applyTreatmentsToSolutions(solutions, enabledTreatments);
    const treatedAnswers = _applyTreatmentsToAnswers(answers, enabledTreatments);

    const numberOfGoodAnswers = _.reduce(treatedAnswers, (goodAnswerNb, answer) => {
      let result = goodAnswerNb;
      _.forEach(treatedSolutions, (solutionList, solutionKey) => {
        if(validateAnswer(answer, solutionList, _.includes(enabledTreatments, 't3'))) {
          treatedSolutions = _.omit(treatedSolutions, solutionKey);
          result += 1;
          return false;
        }
        return true;
      });
      return result;
    }, 0);

    return _formatResult(scoring, numberOfGoodAnswers, _.size(answers));
  },
};
