const { describe, it } = require('mocha');
const { expect } = require('chai');
const service = require('../../../../lib/domain/services/solution-service-utils');


describe('Unit | Domain | Services | solution-service-utils', function () {

  describe('#fuzzyMatchingWithAnswers', function () {

    const correctAnswersList = ['60 582 555', '60582555'];

    [
      { title: 'a string without space', value: '60582555' },
      { title: 'a string with spaces', value: '60 582 555' },
      { title: 'a string with not-breakable spaces', value: '60 582 555' },
      { title: 'a string with normal spaces and not-breakable spaces', value: '60 582 555  ' }
    ].forEach(userAnswer => {

      it(`should return true even when user answer is ${userAnswer.title}`, function () {
        const result = service.fuzzyMatchingWithAnswers(userAnswer.value, correctAnswersList);
        expect(result).to.be.true;
      });
    });

    [
      { title: 'a string with unexpected normal spaces between numbers', value: '6 0 582 555' },
      { title: 'when there is no answer', value: '' },
      { title: 'when it is not the right value', value: '1' },
      { title: 'when it is not a number', value: 'A' }
    ].forEach(userAnswer => {

      it(`should return false even when user answer is ${userAnswer.title}`, function () {
        const result = service.fuzzyMatchingWithAnswers(userAnswer.value, correctAnswersList);
        expect(result).to.be.false;
      });

    });

  });
});
