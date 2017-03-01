/*eslint no-console: ["error", { allow: ["warn", "error"] }] */
const jsYaml = require('js-yaml');
const _ = require('../../infrastructure/utils/lodash-utils');
const utils = require('./solution-service-utils');


function _applyTreatmentsToSolutions(solutions) {
  return _.mapValues(solutions, (validSolutions) => {
    return _.map(validSolutions, (validSolution) => {
      return utils._treatmentT2(utils._treatmentT1(validSolution.toString()));
    });
  });
}


function _applyTreatmentsToAnswers(answers) {
  return _.mapValues(answers, _.toString);
}


function _calculateValidation(answers, solutions) {

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

function _numberOfGoodAnswers(fullValidations) {
  const allGoodAnswers = _goodAnswers(fullValidations);
  const uniqGoodAnswers = _.uniqBy(allGoodAnswers, 'adminAnswers');
  return uniqGoodAnswers.length;
}

function _goodAnswers(fullValidations) {
  return _.chain(fullValidations)
          .map(_goodAnswer)
          .filter((e) => e !== null)
          .value();
}

// the lowest t1t2t3 ratio is below 0.25
function _goodAnswer(allValidations) {
  const bestAnswerSoFar = _.minBy(allValidations, (oneValidation) => oneValidation.t1t2t3Ratio);
  return bestAnswerSoFar.t1t2t3Ratio <= 0.25 ? bestAnswerSoFar : null;
}

function _calculateResult(scoring, validations) {
  let result = 'ok';

  const numberOfGoodAnswers = _numberOfGoodAnswers(validations);

  if (_.isEmpty(scoring) && numberOfGoodAnswers !== _.size(validations)) {
    result = 'ko';
  } else if (_.isEmpty(scoring) && numberOfGoodAnswers === _.size(validations)) {
    result = 'ok';
  } else {

    const minGrade = _.min(Object.keys(scoring));
    const maxGrade = _.max(Object.keys(scoring));

    if (numberOfGoodAnswers >= maxGrade) {
      result = 'ok';
    } else if (numberOfGoodAnswers >= minGrade) {
      result = 'partially';
    } else {
      result = 'ko';
    }
  }
  return result;
}

function _applyPreTreatmentsToAnswer(yamlAnswer) {
  return yamlAnswer.replace(/\u00A0/g, ' ');
}

module.exports = {
  match(yamlAnswer, yamlSolution, yamlScoring) {

    // Validate inputs
    if (_.isNotString(yamlAnswer)
        || _.isNotString(yamlSolution)
        || _.isEmpty(yamlAnswer)
        || !_.includes(yamlSolution, '\n')) {
      return 'ko';
    }

    // Pre-Treatments
    const preTreatedAnswers = _applyPreTreatmentsToAnswer(yamlAnswer);

    // remove unbreakable spaces
    // Convert Yaml to JS objects
    const answers = jsYaml.safeLoad(preTreatedAnswers);
    const solutions = jsYaml.safeLoad(yamlSolution);
    const scoring = jsYaml.safeLoad(yamlScoring);


    // Treatments
    const treatedSolutions = _applyTreatmentsToSolutions(solutions);
    const treatedAnswers = _applyTreatmentsToAnswers(answers);

    // Comparisons
    const fullValidations = _calculateValidation(treatedAnswers, treatedSolutions);

    return _calculateResult(scoring, fullValidations);
  }

};
