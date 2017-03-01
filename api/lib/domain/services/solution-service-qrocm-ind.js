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


function _calculateResult(validations) {
  let result = 'ok';

  _.each(validations, (validation) => {
    if (validation.t1t2t3Ratio > 0.25) {
      result = 'ko';
    }
  });
  return result;
}

function _applyPreTreatmentsToAnswer(yamlAnswer) {
  return yamlAnswer.replace(/\u00A0/g, ' ');
}


module.exports = {

  match (yamlAnswer, yamlSolution) {

    if (_.isNotString(yamlAnswer)
        || _.isNotString(yamlSolution)
        || _.isEmpty(yamlSolution)
        || !_.includes(yamlSolution, '\n')) {
      return 'ko';
    }

    // Pre-Treatments
    const preTreatedAnswers = _applyPreTreatmentsToAnswer(yamlAnswer);

    // remove unbreakable spaces
    // and convert YAML to JSObject
    const answers = jsYaml.safeLoad(preTreatedAnswers);
    const solutions = jsYaml.safeLoad(yamlSolution);

    // Treatments
    const treatedSolutions = _applyTreatmentsToSolutions(solutions);
    const treatedAnswers = _applyTreatmentsToAnswers(answers);

    //Comparison
    const validations = _.map(treatedAnswers, function(answer, keyAnswer) {
      const solutionsToAnswer = treatedSolutions[keyAnswer];
      return utils.treatmentT1T2T3(answer, solutionsToAnswer);
    });

    //Restitution
    return _calculateResult(validations);

  }

};
