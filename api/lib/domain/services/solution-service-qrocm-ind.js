const utils = require('./solution-service-utils');
const yaml = require('js-yaml');
const _ = require('lodash');

module.exports = {

  match (yamlAnswer, yamlSolution) {
    try {
      let result = 'ko';
      const answer = yaml.load(yamlAnswer);
      const solution = yaml.load(yamlSolution);
      const everyAnswerMatchItsSolution = _.every(solution, function(possibleAnswers, key) {
        return utils.fuzzyMatchingWithAnswers(answer[key], possibleAnswers);
      });
      if (everyAnswerMatchItsSolution) {
        result = 'ok';
      }
      return result;
    } catch (e) { // Parse exceptions like script injection could happen. They are detected here.
      return 'ko';
    }
  }

};
