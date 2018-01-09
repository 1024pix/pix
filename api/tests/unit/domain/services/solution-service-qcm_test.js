const { describe, it, expect } = require('../../../test-helper');

const service = require('../../../../lib/domain/services/solution-service-qcm');
const Answer = require('../../../../lib/domain/models/data/answer');
const AnswerStatus = require('../../../../lib/domain/models/AnswerStatus');
const Solution = require('../../../../lib/domain/models/referential/solution');
const _ = require('../../../../lib/infrastructure/utils/lodash-utils');

describe('Unit | Service | SolutionServiceQCM ', function() {

  function buildSolution(type, value, scoring) {
    const solution = new Solution({ id: 'solution_id' });
    solution.type = type;
    solution.value = value;
    solution.scoring = _.ensureString(scoring).replace(/@/g, '');
    return solution.value;
  }

  function buildAnswer(value, timeout) {
    const answer = new Answer({ id: 'answer_id' });
    answer.attributes = { value, timeout };
    return answer.get('value');
  }

  describe('if solution type is QCM', function() {

    const successfulCases = [
      { answer: '1', solution: '1' },
      { answer: '1, 2', solution: '1, 2' },
      { answer: '1, 2, 3', solution: '1, 2, 3' },
      { answer: '1,2,3', solution: '1,2,3' },
      { answer: '3, 2, 1', solution: '1, 2, 3' },
      { answer: '1,2,3', solution: '1, 2, 3' },
      { answer: '1,   2,   3   ', solution: '1, 2, 3' },
      { answer: '1, 2, 3', solution: '1, 2, 3' }
    ];

    successfulCases.forEach(function(testCase) {
      it('should return "ok" when answer is "' + testCase.answer + '" and solution is "' + testCase.solution + '"', function() {
        const answer = buildAnswer(testCase.answer);
        const solution = buildSolution('QCM', testCase.solution);
        const result = service.match(answer, solution);
        expect(AnswerStatus.isOK(result)).to.be.true;
      });
    });

    const failedCases = [
      { answer: '2', solution: '1' },
      { answer: '1, 3', solution: '1, 2' },
      { answer: '1, 2, 3', solution: '1, 2' },
      { answer: '3, 1', solution: '1, 2' }
    ];

    failedCases.forEach(function(testCase) {
      it('should return "ko" when answer is "' + testCase.answer + '" and solution is "' + testCase.solution + '"', function() {
        const answer = buildAnswer(testCase.answer);
        const solution = buildSolution('QCM', testCase.solution);
        const result = service.match(answer, solution);
        expect(AnswerStatus.isKO(result)).to.be.true;
      });
    });

  });

});
