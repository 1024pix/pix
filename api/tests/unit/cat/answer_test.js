const { expect, factory } = require('../../test-helper');
const CatAnswer = require('../../../lib/cat/answer');

describe('Unit | Model | Answer', function() {

  describe('#maxDifficulty', function() {
    it('should exist', function() {
      // given
      const answer = factory.buildCatAnswer();

      // then
      expect(answer.maxDifficulty).to.exist;
    });

    it('should return the maximal skill difficulty of a challenge', function() {
      // given
      const givenMaxDifficulty = 5;
      const answer = factory.buildCatAnswer({
        challenge: factory.buildCatChallenge({
          skills: factory.buildCatTube({ maxLevel: givenMaxDifficulty })
        })
      });

      // when
      const result = answer.maxDifficulty;

      // then
      expect(result).to.equal(givenMaxDifficulty);
    });

    it('should return 2 if the challenge is undefined', function() {
      // given
      const answer = new CatAnswer(undefined, 'ok');

      // when
      const maxDifficulty = answer.maxDifficulty;

      // then
      expect(maxDifficulty).to.equal(2);
    });
  });

  describe('#binaryOutcome', function() {
    it('should exist', function() {
      // given
      const answer = factory.buildCatAnswer();

      // then
      expect(answer.binaryOutcome).to.exist;
    });

    it('should return 1 if answer is correct', function() {
      // given
      const answer = factory.buildCatAnswer({ result: 'ok' });

      // when
      const binaryOutcome = answer.binaryOutcome;

      // then
      expect(binaryOutcome).to.equal(1);
    });

    it('should return 0 if answer is not correct', function() {
      // given
      const answer = factory.buildCatAnswer({ result: 'ko' });

      // when
      const binaryOutcome = answer.binaryOutcome;

      // then
      expect(binaryOutcome).to.equal(0);
    });
  });

});
