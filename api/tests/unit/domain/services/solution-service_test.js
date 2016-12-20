/* global describe, it, expect */

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

  describe('#match', function () {

    describe('if answer is #ABAND#', function () {

      it('should return "aband"', function () {
        const answer = buildAnswer('#ABAND#');
        const solution = buildSolution('SOME_TYPE', null);
        expect(service.match(answer, solution)).to.equal('aband');
      });

    });

    describe('if solution type is QRU', function () {

      it('should return "not-implemented"', function () {
        const answer = buildAnswer('some answer');
        const solution = buildSolution('QRU', 'some value');
        expect(service.match(answer, solution)).to.equal('not-implemented');
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

    describe('if solution type is QROCM-ind', function () {

      it('should return "ko" when answer does not match any solution variants', function () {
        const answer = buildAnswer('answer: unmatching answer');
        const solution = buildSolution('QROCM-ind', 'answer:\n- unmatched solution variant');
        expect(service.match(answer, solution)).to.equal('ko');
      });

      const successfulCases = [
        { answer: '9lettres: courgette\n6lettres: tomate',
          solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- etamot' },
        { answer: '9lettres: courgette\n6lettres: etamot',
          solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- etamot' },
        { answer: 'a: "1"\nb: "2"',
          solution: 'a:\n- 1\nb:\n- 2' }
      ];

      successfulCases.forEach(function (testCase) {
        it('should return "ok" when answer is "' + testCase.answer + '" and solution is "' + escape(testCase.solution) + '"', function () {
          const answer = buildAnswer(testCase.answer);
          const solution = buildSolution('QROCM-ind', testCase.solution);
          expect(service.match(answer, solution)).to.equal('ok');
        });
      });

      const failedCases = [
        { answer: '9lettres: courgette\n6lettres: tomates', // notice "s" at the end of tomates
          solution: '9lettres:\n- courgette\n6lettres:\n- tomate\n- etamot' },
      ];

      failedCases.forEach(function (testCase) {
        it('should return "ko" when answer is "' + testCase.answer + '" and solution is "' + escape(testCase.solution) + '"', function () {
          const answer = buildAnswer(testCase.answer);
          const solution = buildSolution('QROCM-ind', testCase.solution);
          expect(service.match(answer, solution)).to.equal('ko');
        });
      });

    });

    describe('if solution type is QROCM-dep', function () {

      it('should return "ko" for badly formatted solution', function () {
        const answer = buildAnswer('num1: Google\nnum2: Yahoo');
        const solution = buildSolution('QROCM-dep', 'solution like a QCU');
        expect(service.match(answer, solution)).to.equal('ko');
      });

      it('should return "ko" when answer is incorrect', function () {
        const answer = buildAnswer('num1: Foo\nnum2: Bar');
        const solution = buildSolution('QROCM-dep', 'Google:\n- Google\n- google.fr\n- Google Search\nYahoo:\n- Yahoo\n- Yahoo Answer');
        expect(service.match(answer, solution)).to.equal('ko');
      });

      it('should return "ko" when user duplicated a correct answer', function () {
        const answer = buildAnswer('num1: google.fr\nnum2: google.fr');
        const solution = buildSolution('QROCM-dep', 'Google:\n- Google\n- google.fr\n- Google Search\nYahoo:\n- Yahoo\n- Yahoo Answer');
        expect(service.match(answer, solution)).to.equal('ko');
      });

      const maximalScoreCases = [
        { answer: 'num1: " google.fr"\nnum2: "Yahoo anSwer "',
          solution: 'Google:\n- Google\n- google.fr\n- Google Search\nYahoo:\n- Yahoo\n- Yahoo Answer' },
      ];

      maximalScoreCases.forEach(function (testCase) {
        it('should return "ok" when answer is "' + testCase.answer + '" and solution is "' + escape(testCase.solution) + '"', function () {
          const answer = buildAnswer(testCase.answer);
          const solution = buildSolution('QROCM-dep', testCase.solution);
          expect(service.match(answer, solution)).to.equal('ok');
        });
      });

    });

    describe('if solution type is none of the above ones', function () {

      it('should return "not-implemented"', function () {
        const answer = buildAnswer('some value');
        const solution = buildSolution('SOME_TYPE', 'Some variant');
        expect(service.match(answer, solution)).to.equal('not-implemented');
      });

    });

  });

});
