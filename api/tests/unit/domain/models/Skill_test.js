const Skill = require('../../../../lib/domain/models/Skill');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | Skill', () => {

  describe('#Difficulty', function() {
    it('should return the difficulty of the skill', function() {
      // given
      const url1 = new Skill({ name: '@url1' });

      // then
      expect(url1.difficulty).to.be.equal(1);
    });
  });

  describe('#tubeNameWithoutPrefix', function() {
    it('should return the name of the tube', function() {
      // given
      const url1 = new Skill({ name: '@url1' });

      // then
      expect(url1.tubeNameWithoutPrefix).to.be.equal('url');
    });
  });

  describe('#tubeName', () => {
    it('should have a property fromListOfSkill', () => {
      // when
      const skill = new Skill({ name: '@web3' });

      // then
      expect(skill.tubeName).to.equal('@web');
    });
  });

  describe('#areEqual()', function() {
    it('should return false when two skills are not the same', () => {
      // given
      const [skill1, skill2] = domainBuilder.buildSkillCollection();
      // when
      const result = Skill.areEqual(skill1, skill2);
      // then
      expect(result).to.be.false;
    });

    it('should return true if two skills have the same name', () => {
      // given
      const skill = domainBuilder.buildSkill({ name: '@skill1' });
      const otherSkill = domainBuilder.buildSkill({ name: '@skill1' });
      // when
      const result = Skill.areEqual(skill, otherSkill);
      // then
      expect(result).to.be.true;
    });

    it('should return false if either argument is undefined', () => {
      // given
      const skill = domainBuilder.buildSkill({ name: '@skill1' });
      const otherSkill = undefined;
      // when
      const result1 = Skill.areEqual(skill, otherSkill);
      const result2 = Skill.areEqual(otherSkill, skill);
      // then
      expect(result1).to.be.false;
      expect(result2).to.be.false;
    });
  });

  describe('#areEqualById()', function() {
    it('should return false when two skills are not the same', () => {
      // given
      const [skill1, skill2] = domainBuilder.buildSkillCollection();
      // when
      const result = Skill.areEqualById(skill1, skill2);
      // then
      expect(result).to.be.false;
    });

    it('should return false if two skills have the same name but different ids', () => {
      // given
      const skill = domainBuilder.buildSkill({ name: '@skill1' });
      const otherSkill = domainBuilder.buildSkill({ name: '@skill1' });
      // when
      const result = Skill.areEqualById(skill, otherSkill);
      // then
      expect(result).to.be.false;
    });

    it('should return false if either argument is undefined', () => {
      // given
      const skill = domainBuilder.buildSkill({ name: '@skill1' });
      const otherSkill = undefined;
      // when
      const result1 = Skill.areEqualById(skill, otherSkill);
      const result2 = Skill.areEqualById(otherSkill, skill);
      // then
      expect(result1).to.be.false;
      expect(result2).to.be.false;
    });

    it('should return true if if two skills have the same ids', () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'rec1234567890' });
      const otherSkill = domainBuilder.buildSkill({ id: 'rec1234567890' });
      // when
      const result = Skill.areEqualById(skill, otherSkill);
      // then
      expect(result).to.be.true;
    });
  });
});
