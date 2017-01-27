const jsYaml = require('js-yaml');
const _ = require('lodash');


function applyTreatmentsToAnswers(answers) {
  _.each(answers, (answer, index) => {
    answers[index] = answer.toString().trim().toLowerCase();
  });
  return answers;
}
function applyTreatmentsToSolutions(solutions) {
  _.each(solutions, (solution, index) => {
    const validOptions = [];
    solution.forEach((validValue) => {
      validOptions.push(validValue.toString().trim().toLowerCase());
    });
    solutions[index] = validOptions;
  });
  return solutions;
}
function compareAnswersAndSolutions(answers, solutions) {
  const validations = {};
  const keys = Object.keys(answers);

  keys.forEach((key) => {
    validations[key] = solutions[key].includes(answers[key]);
  });
  return validations;
}
function calculateResult(validations) {
  let result = 'ok';

  _.each(validations, (validation) => {
    if (validation === false) {
      result = 'ko';
    }
  });
  return result;
}
module.exports = {

  match (yamlAnswer, yamlSolution) {

    //convert YAML to JSObject
    let answers = jsYaml.load(yamlAnswer);
    let solutions = jsYaml.load(yamlSolution);

    //Treatments
    answers = applyTreatmentsToAnswers(answers);
    solutions = applyTreatmentsToSolutions(solutions);

    //Comparison
    const validations = compareAnswersAndSolutions(answers, solutions);

    //Restitution
    return calculateResult(validations);

  }

};
