const { describe, it } = require('mocha');
const { expect } = require('chai');
const service = require('../../../../lib/domain/services/assessment-service-utils');

describe('Unit | Domain | Services | assessment-service-utils', function() {

  describe('#getResponsePattern', function() {

    const correctAnswer = {attributes: {result: 'ok'}};
    const incorrectAnswer = {attributes: {result: 'ko'}};
    const partialAnswer = {attributes: {result: 'partial'}};

    [
      { answers: [correctAnswer, incorrectAnswer, partialAnswer], title: 'correct, incorrect, partial', value: 'ok-ko-ko' },
      { answers: [], value: '' }
    ].forEach(pattern => {

      it(`should return "${pattern.value}" when user pattern is ${pattern.title}`, function() {
        expect(service.getResponsePattern(pattern.answers)).to.equal(pattern.value);
      });
    });

  });
});
