const utils = require('./solution-service-utils');
const _ = require('lodash');

module.exports = {

  match (answer, solution) {
    if (_.isString(solution) && solution.length > 0 && utils.fuzzyMatchingWithAnswers(answer, solution.split('\n'))) {
      return 'ok';
    }
    return 'ko';
  }
};
