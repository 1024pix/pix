const utils = require('./solution-service-utils');

module.exports = {

  match (answer, solution) {

    if (utils.areStringListEquivalent(answer, solution)) {
      return 'ok';
    }
    return 'ko';
  }

};
