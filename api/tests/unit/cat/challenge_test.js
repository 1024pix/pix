const { expect, factory } = require('../../test-helper');

const CatChallenge = require('../../../lib/cat/challenge');
const CatSkill = require('../../../lib/cat/skill');

describe('Unit | Model | Challenge', function() {

  describe('#hardestSkill', function() {
    it('should exist', function() {
      // given
      const url1 = new CatSkill('url1');
      const challenge = new CatChallenge('recXXX', 'validé', [url1]);

      // then
      expect(challenge.hardestSkill).to.exist;
    });

    it('should be web5 if challenge requires url1 and web5', function() {
      // given
      const web5 = new CatSkill('web5');
      const url1 = new CatSkill('url1');
      const challenge = new CatChallenge('recXXX', 'validé', [url1, web5]);

      // then
      expect(challenge.hardestSkill).to.equal(web5);
    });
  });

  describe('#isActive', function() {

    it('should return true if the status is an active status', function() {
      // given
      const challenge = factory.buildCatChallenge({ status: 'validé' });

      // then
      expect(challenge.isActive).to.equal(true);
    });

    it('should return false if the status is not an active status', function() {
      // given
      const challenge = factory.buildCatChallenge({ status: 'test' });

      // then
      expect(challenge.isActive).to.equal(false);
    });

  });

  describe('#testsAtLeastOneNewSkill', function() {

    it('returns true if the challenge is not already assessed', function() {
      // given
      const [s1] = factory.buildCatTube();
      const challenge = factory.buildCatChallenge({ skills: [s1] });
      const assessedSkills = [];
      // whe
      const response = challenge.testsAtLeastOneNewSkill(assessedSkills);
      // then
      expect(response).to.be.true;
    });

    it('should return false if the challenge\'s skill is already assessed', function() {
      // given
      const [s1] = factory.buildCatTube();
      const challenge = factory.buildCatChallenge({ skills: [s1] });
      const assessedSkills = [s1];
      // when
      const response = challenge.testsAtLeastOneNewSkill(assessedSkills);
      // then
      expect(response).to.be.false;
    });

    it('should return true if the challenge has a unique skill not assessed', function() {
      // given
      const [s1, s2, s3] = factory.buildCatTube({ max: 3 });
      const challenge = factory.buildCatChallenge({ skills: [s3] });
      const assessedSkills = [s1, s2];
      // when
      const response = challenge.testsAtLeastOneNewSkill(assessedSkills);
      // then
      expect(response).to.be.true;
    });

    it('should return true if the challenge has at least a skill not assessed', function() {
      // given
      const [s1, s2, s3] = factory.buildCatTube({ max: 3 });
      const challenge = factory.buildCatChallenge({ skills: [s2, s3] });
      const assessedSkills = [s1, s2];
      // when
      const response = challenge.testsAtLeastOneNewSkill(assessedSkills);
      // then
      expect(response).to.be.true;
    });

    it('should return false if the challenge has a skill assessed of the same name (but different object)', function() {
      // given
      const skill = new CatSkill('@skill1');
      const sameSkill = new CatSkill('@skill1');
      const challenge = factory.buildCatChallenge({ skills: [skill] });
      // when
      const response = challenge.testsAtLeastOneNewSkill([sameSkill]);
      // then
      expect(response).to.be.false;
    });

    it('should return false if the challenge has only one skill and is already assessed', function() {
      // given
      const [s1, s2] = factory.buildCatTube({ max: 3 });
      const challenge = factory.buildCatChallenge({ skills: [s2] });
      const assessedSkills = [s1, s2];
      // when
      const response = challenge.testsAtLeastOneNewSkill(assessedSkills);
      // then
      expect(response).to.be.false;
    });
  });
});
