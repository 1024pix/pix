const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | Target-Profile/TargetedTube', () => {

  describe('hasSkill', () => {

    it('should return true when the skill is in tube', () => {
      // given
      const skill = domainBuilder.buildTargetedSkill({ id: 'skillId', tubeId: 'tubeId' });
      const tube = domainBuilder.buildTargetedTube({ id: 'tubeId', skills: [skill] });

      // when
      const isIncluded = tube.hasSkill(skill.id);

      // then
      expect(isIncluded).to.be.true;
    });

    it('should return false when the skill is not in tube', () => {
      // given
      const tube = domainBuilder.buildTargetedTube({ id: 'tubeId', skills: [] });

      // when
      const isIncluded = tube.hasSkill('someSkillId');

      // then
      expect(isIncluded).to.be.false;
    });
  });
});
