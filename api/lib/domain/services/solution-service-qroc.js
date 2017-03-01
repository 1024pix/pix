const utils = require('./solution-service-utils');
const _ = require('../../infrastructure/utils/lodash-utils');

function _applyPreTreatmentsToSolutions(solution) {
  return  _.chain(solution)
            .split('\n')
            .reject(_.isEmpty)
            .value();
}

function _applyTreatmentsToSolutions(solution) {
  const pretreatedSolutions = _applyPreTreatmentsToSolutions(solution);
  return  _.map(pretreatedSolutions, (pretreatedSolution) => {
    return utils._treatmentT2(utils._treatmentT1(pretreatedSolution));
  });
}

// remove unbreakable space
function _applyAnswerTreatment(strArg) {
  return strArg.replace(/\u00A0/g, ' ');
}



module.exports = {

  match (answer, solution) {

    if (_.isNotString(answer) || _.isNotString(solution) || _.isEmpty(solution)) {
      return 'ko';
    }

    const treatedAnswer = _applyAnswerTreatment(answer);
    const treatedSolutions = _applyTreatmentsToSolutions(solution);

    const validations = utils.treatmentT1T2T3(treatedAnswer, treatedSolutions);

    if (validations.t1t2t3Ratio <= 0.25) {
      return 'ok';
    }
    return 'ko';
  }
};
