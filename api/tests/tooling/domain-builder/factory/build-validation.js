const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Validation = require('../../../../lib/domain/models/Validation');

module.exports = function({
  result = AnswerStatus.OK,
  resultDetails = 'Bravo',
} = {}) {

  return new Validation({
    result,
    resultDetails,
  });
};

