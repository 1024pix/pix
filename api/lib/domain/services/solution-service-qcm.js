const _ = require('../../infrastructure/utils/lodash-utils');

module.exports = {

  match(answer, solution) {

    if (_.areCSVequivalent(answer, solution)) {
      return 'ok';
    }
    return 'ko';
  }

};
