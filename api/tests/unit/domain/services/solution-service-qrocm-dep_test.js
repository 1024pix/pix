const { describe, it, expect } = require('../../../test-helper');
const service = require('../../../../lib/domain/services/solution-service-qrocm-dep');

describe('Unit | Service | SolutionServiceQrocmDep', function () {

  describe('#match', function () {

    describe('when challenge has no scoring defined', function () {

      describe('when expected solutions are strings', function () {

        const solution = `Google:\n- google\n- google.fr\n- google.com\n- google search\nYahoo:\n- yahoo\n- yahoo search\n- yahoo.fr\n- yahoo.com\nAltavista:\n- altavista\n- altavista.fr\n- altavista.com\nBing:\n- bing\n- bing.fr\n- bing.com`;
        const scoring = null;

        it('should return "ok" if given answer matches solution', function () {
          // given
          const goodAnswer = `moteur 1: yahoo\nmoteur 2: google\nmoteur 3: bing`;
          // when
          const result = service.match(goodAnswer, solution, scoring);
          // then
          expect(result).to.equal('ok');
        });

        [
          `moteur 1: yahoo\nmoteur 2: google\nmoteur 3: mauvaise_reponse`,
          `moteur 1: yahoo\nmoteur 2: google\nmoteur 3: ''`,
          `moteur 1: yahoo\nmoteur 2: google\nmoteur 3: 'google.fr'`
        ].forEach(function (badAnswer) {
          it(`should return "ko" if the given answer doesn't match the solution (answer = ${badAnswer})`, function () {
            const result = service.match(badAnswer, solution, scoring);
            expect(result).to.equal('ko');
          });
        });
      });

      describe('when expected solutions are numbers', function () {

        const solution = `solA:\n- 1\n- 2\n- 3\nsolB:\n- 4\n- 5\n- 6`;
        const scoring = null;

        [
          `solA: '2'\nsolB: '4'`,
          `solA: '4'\nsolB: '2'`
        ].forEach(function (goodAnswer) {
          it(`should return "ok" if given answer matches solution (answer = ${goodAnswer})`, function () {
            const result = service.match(goodAnswer, solution, scoring);
            expect(result).to.equal('ok');
          });
        });

        [
          `solA: '2'\nsolB: '888'`,
          `solA: '888'\nsolB: '2'`,
          `solA: '1'\nsolB: '2'`,
          `solA: '4'\nsolB: '5'`,
          `solA: '1'\nsolB: ''`,
        ].forEach(function (badAnswer) {
          it(`should return "ko" if given answer doesn't matches solution (answer = ${badAnswer})`, function () {
            const result = service.match(badAnswer, solution, scoring);
            expect(result).to.equal('ko');
          });
        });

      });

    });

    describe('when challenge has scoring', function () {

      describe('when expected solutions are strings', function () {

        const solution = `Google:\n- google\n- google.fr\n- google.com\n- google search\nYahoo:\n- yahoo\n- yahoo search\n- yahoo.fr\n- yahoo.com\nAltavista:\n- altavista\n- altavista.fr\n- altavista.com\nBing:\n- bing\n- bing.fr\n- bing.com`;
        const scoring = `1: "@rechinfo1"\n2: "@rechinfo2"\n3: "@rechinfo3"`;

        [
          `moteur 1: 'yahoo'\nmoteur 2: 'google'\nmoteur 3: 'bing'`,
          `moteur 1: 'YAHOO'\nmoteur 2: 'Google'\nmoteur 3: 'binG'`,
          `moteur 1: 'yahoo  '\nmoteur 2: ' google'\nmoteur 3: '  bing   '`
        ].forEach(function (answer) {
          it(`should return "ok" if given answer matches solution (answer = ${answer})`, function () {
            const result = service.match(answer, solution, scoring);
            expect(result).to.equal('ok');
          });
        });

        [
          `moteur 1: 'yahoo'\nmoteur 2: 'google'\nmoteur 3: 'mauvaise_reponse'`,
          `moteur 1: 'yahoo'\nmoteur 2: 'google'\nmoteur 3: ''`,
          `moteur 1: 'yahoo'\nmoteur 2: 'google'\nmoteur 3: 'google.fr'`,
          `moteur 1: 'yahoo'\nmoteur 2: 'google'`
        ].forEach(function (answer) {
          it(`should return "partially" if the given answer doesn't totally match the solution (answer = ${answer})`, function () {
            const result = service.match(answer, solution, scoring);
            expect(result).to.equal('partially');
          });
        });

        [
          `moteur 1: 'facebook'\nmoteur 2: ''\nmoteur 3: 'mauvaise_reponse'`,
          `moteur 1: 'facebook'\nmoteur 2: 'twitter'\nmoteur 3: ''`
        ].forEach(function (answer) {
          it(`should return "ko" if the given answer doesn't match the solution (answer = ${answer})`, function () {
            const result = service.match(answer, solution, scoring);
            expect(result).to.equal('ko');
          });
        });

      });

      describe('when expected solutions are numbers', function () {

        const solution = `solA:\n- 1\n- 2\n- 3\nsolB:\n- 4\n- 5\n- 6`;
        const scoring = null;

        [
          `solA: '2'\nsolB: '4'`,
          `solA: '4'\nsolB: '2'`
        ].forEach(function (goodAnswer) {
          it(`should return "ok" if given answer matches solution (answer = ${goodAnswer})`, function () {
            const result = service.match(goodAnswer, solution, scoring);
            expect(result).to.equal('ok');
          });
        });

        [
          `solA: '2'\nsolB: '888'`,
          `solA: '888'\nsolB: '2'`,
          `solA: '1'\nsolB: '2'`,
          `solA: '4'\nsolB: '5'`,
          `solA: '1'\nsolB: ''`,
        ].forEach(function (badAnswer) {
          it(`should return "ko" if given answer doesn't matches solution (answer = ${badAnswer})`, function () {
            const result = service.match(badAnswer, solution, scoring);
            expect(result).to.equal('ko');
          });
        });

      });

    });

  });
});


