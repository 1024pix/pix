const expect = require('chai').expect;
const Challenge = require('../../../lib/cat/challenge');
const Skill = require('../../../lib/cat/skill');

describe('Unit | Model | Challenge', function() {

  describe('#hardestSkill', function() {
    it('should exist', function() {
      // given
      const url1 = new Skill('url1');
      const challenge = new Challenge('recXXX', 'validé', [url1]);

      // then
      expect(challenge.hardestSkill).to.exist;
    });

    it('should be web5 if challenge requires url1 and web5', function() {
      // given
      const web5 = new Skill('web5');
      const url1 = new Skill('url1');
      const challenge = new Challenge('recXXX', 'validé', [url1, web5]);

      // then
      expect(challenge.hardestSkill).to.equal(web5);
    });
  });

  describe('#isActive', function() {

    it('should return true if the status is an active status', function() {
      // given
      const challenge = new Challenge('recXXX', 'validé', []);

      // then
      expect(challenge.isActive).to.equal(true);
    });

    it('should return false if the status is not an active status', function() {
      // given
      const challenge = new Challenge('recXXX', 'test', []);

      // then
      expect(challenge.isActive).to.equal(false);
    });

  });
});
