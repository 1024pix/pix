const Answer = require('../../../../lib/domain/models/Answer');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | Answer', () => {

  describe('#maxDifficulty', function() {
    it('should exist', function() {
      // given
      const challenge = new Challenge();
      const answer = new Answer({ result: 'ko' });
      answer.challengeObject = challenge;
      // then
      expect(answer.maxDifficulty).to.exist;
    });

    it('should return the maximal skill difficulty of a challenge', function() {
      // given
      const web5 = new Skill({ name: '@web5' });
      const url1 = new Skill({ name: '@url1' });
      const challenge = new Challenge();
      challenge.addSkill(web5);
      challenge.addSkill(url1);
      const answer = new Answer({ result: 'ko' });
      answer.challengeObject = challenge;

      // when
      const maxDifficulty = answer.maxDifficulty();

      // then
      expect(maxDifficulty).to.equal(5);
    });

    it('should return the base difficulty if the challenge is undefined', function() {
      // given
      const answer = new Answer({ });

      const baseDifficulty = 2;
      // when
      const maxDifficulty = answer.maxDifficulty(baseDifficulty);

      // then
      expect(maxDifficulty).to.equal(baseDifficulty);
    });
  });

  describe('#binaryOutcome', function() {
    it('should exist', function() {
      // given
      const answer = new Answer({ result: 'ko' });

      // then
      expect(answer.binaryOutcome).to.exist;
    });

    it('should return 1 if answer is correct', function() {
      // given
      const answer = new Answer({ result: 'ok' });

      // when
      const maxDifficulty = answer.binaryOutcome;

      // then
      expect(maxDifficulty).to.equal(1);
    });

    it('should return 0 if answer is not correct', function() {
      // given
      const answer = new Answer({ result: 'ko' });

      // when
      const maxDifficulty = answer.binaryOutcome;

      // then
      expect(maxDifficulty).to.equal(0);
    });
  });

});
