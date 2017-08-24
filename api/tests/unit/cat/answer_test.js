const expect = require('chai').expect;
const Answer = require('../../../lib/cat/answer');
const Skill = require('../../../lib/cat/skill');
const Challenge = require('../../../lib/cat/challenge');

describe('Unit | Model | Answer', function() {

  describe('#maxDifficulty', function() {
    it('should exist', function() {
      // given
      const url1 = new Skill('url', 1);
      const challenge = new Challenge('recXXX', [url1]);
      const answer = new Answer(challenge, 'ko');

      // then
      expect(answer.maxDifficulty).to.exist;
    });

    it('should return the maximal skill difficulty of a challenge', function() {
      // given
      const web5 = new Skill('web', 5);
      const url1 = new Skill('url', 1);
      const challenge = new Challenge('recXXX', [url1, web5]);
      const answer = new Answer(challenge, 'ok');

      // when
      const maxDifficulty = answer.maxDifficulty;

      // then
      expect(maxDifficulty).to.equal(5);
    });
  });

  describe('#binaryOutcome', function() {
    it('should exist', function() {
      // given
      const challenge = new Challenge('recXXX', []);
      const answer = new Answer(challenge, 'ko');

      // then
      expect(answer.binaryOutcome).to.exist;
    });

    it('should return 1 if answer is correct', function() {
      // given
      const challenge = new Challenge('recXXX', []);
      const answer = new Answer(challenge, 'ok');

      // when
      const maxDifficulty = answer.binaryOutcome;

      // then
      expect(maxDifficulty).to.equal(1);
    });

    it('should return 0 if answer is not correct', function() {
      // given
      const challenge = new Challenge('recXXX', []);
      const answer = new Answer(challenge, 'partial');

      // when
      const maxDifficulty = answer.binaryOutcome;

      // then
      expect(maxDifficulty).to.equal(0);
    });
  });

});
