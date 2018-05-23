const expect = require('chai').expect;

const Challenge = require('../../../lib/cat/challenge');
const factory = require('../../factory');
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

  describe('#skillsFullyIncludedIn', function() {
    /*


    challenge => s2
    answers => s2 OK => this.assessedSkills => [s1 OK, s2 OK]
    => NON

    challenge => s2
    answers => s2 KO => this.assessedSkills => [s2 KO, s3 KO, ...]
    => NON

    challenge => s2, s3
    answers => s2 OK => this.assessedSkills => [s1 OK, s2 OK]
    => OUI

    challenge => s2, s3
    answers => s2 KO => this.assessedSkills => [s2 KO, s3 KO, s4 KO...]
    => NON
    */

    it('returns true if the challenge is not already assessed', function() {
      // given
      const skills = factory.buildCatTube();
      const challenge = factory.buildCatChallenge({ skills: [skills[0]] });
      const assessedSkills = [];
      // whe
      const response = challenge.skillsFullyIncludedIn(assessedSkills);
      // then
      expect(response).to.be.true;
    });

    it('should return false if the challenge\'s skill is already assessed', function() {
      // given
      const skills = factory.buildCatTube();
      const challenge = factory.buildCatChallenge({ skills: [skills[0]] });
      const assessedSkills = [skills[0]];
      // when
      const response = challenge.skillsFullyIncludedIn(assessedSkills);
      // then
      expect(response).to.be.false;
    });

    it('should return true if the challenge has a skill not assessed', function() {
      // given
      const [s1, s2, s3] = factory.buildCatTube({ max: 3 });
      const challenge = factory.buildCatChallenge({ skills: [s2, s3] });
      const assessedSkills = [s1, s2];
      // when
      const response = challenge.skillsFullyIncludedIn(assessedSkills);
      // then
      expect(response).to.be.true;
    });

    it('should return false if the challenge has only one skill and is already assessed', function() {
      // given
      const [s1, s2] = factory.buildCatTube({ max: 3 });
      const challenge = factory.buildCatChallenge({ skills: [s2] });
      const assessedSkills = [s1, s2];
      // when
      const response = challenge.skillsFullyIncludedIn(assessedSkills);
      // then
      expect(response).to.be.false;
    });
  });
});
