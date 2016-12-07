const service = require('../../../../lib/domain/services/solution-service');
const Answer = require('../../../../lib/domain/models/data/answer');
const Solution = require('../../../../lib/domain/models/referential/solution');

describe('Unit | Service | SolutionService', function () {

  function buildSolution(type, value) {
    const solution = new Solution({ id: 'solution_id' });
    solution.type = type;
    solution.value = value;
    return solution;
  }

  function buildAnswer(value) {
    const answer = new Answer({ id: 'answer_id' });
    answer.attributes = { value };
    return answer;
  }

  describe("#match", function () {

    describe('if answer is #ABAND#', function () {

      it('should return "aband"', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('SOME_TYPE', null);
        expect(service.match(answer, solution)).to.equal('aband');
      });

    });

    describe('if solution type is QRU', function () {

      it('should return "pending"', function () {
        const answer = buildAnswer('some answer');
        const solution = buildSolution('QRU', 'some value');
        expect(service.match(answer, solution)).to.equal('pending');
      });

    });

    describe('if solution type is QCU', function () {

      it('should return "ok" when answer and solution are equal', function () {
        const answer = buildAnswer('same value');
        const solution = buildSolution('QCU', 'same value');
        expect(service.match(answer, solution)).to.equal('ok');
      });

      it('should return "ko" when answer and solution are different', function () {
        const answer = buildAnswer('answer value');
        const solution = buildSolution('QCU', 'different solution value');
        expect(service.match(answer, solution)).to.equal('ko');
      });

    });

    describe('if solution type is QCM', function () {

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

      successfulCases.forEach(function (testCase) {
        it('should return "ok" when answer is "' + testCase.answer + '" and solution is "' + testCase.solution + '"', function () {
          const answer = buildAnswer(testCase.answer);
          const solution = buildSolution('QCM', testCase.solution);
          expect(service.match(answer, solution)).to.equal('ok');
        });
      });

      const failedCases = [
        { answer: '2', solution: '1' },
        { answer: '1, 3', solution: '1, 2' },
        { answer: '1, 2, 3', solution: '1, 2' },
        { answer: '3, 1', solution: '1, 2' }
      ];

      failedCases.forEach(function (testCase) {
        it('should return "ko" when answer is "' + testCase.answer + '" and solution is "' + testCase.solution + '"', function () {
          const answer = buildAnswer(testCase.answer);
          const solution = buildSolution('QCM', testCase.solution);
          expect(service.match(answer, solution)).to.equal('ko');
        });
      });

    });

    describe('if solution type is QROC', function () {

      it('should return "ko" when answer does not match any solution variants', function () {
        const answer = buildAnswer('unmatching answer');
        const solution = buildSolution('QROC', 'unmatched solution variant');
        expect(service.match(answer, solution)).to.equal('ko');
      });

      const successfulCases = [
        { answer: 'Answer', solution: 'Answer' },
        { answer: 'ANSWER', solution: 'answer' },
        { answer: 'answer', solution: 'ANSWER' },
        { answer: 'answer with spaces', solution: 'Answer With Spaces' },
        { answer: 'with accents', solution: 'wîth àccénts' },
        { answer: 'variant 1', solution: 'variant 1\nvariant 2\nvariant 3\n' },
        { answer: 'variant 2', solution: 'variant 1\nvariant 2\nvariant 3\n' },
        { answer: 'variant 3', solution: 'variant 1\nvariant 2\nvariant 3\n' }
      ];

      successfulCases.forEach(function (testCase) {
        it('should return "ok" when answer is "' + testCase.answer + '" and solution is "' + escape(testCase.solution) + '"', function () {
          const answer = buildAnswer(testCase.answer);
          const solution = buildSolution('QROC', testCase.solution);
          expect(service.match(answer, solution)).to.equal('ok');
        });
      });
    });

    describe('if solution type is none of the above ones', function () {

      it('should return "pending"', function () {
        const answer = buildAnswer('some value');
        const solution = buildSolution('SOME_TYPE', 'Some variant');
        expect(service.match(answer, solution)).to.equal('pending');
      });

    });

  });

});
