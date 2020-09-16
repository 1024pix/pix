const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | TargetProfile', () => {

  describe('findSkillById', () => {

    it('should return the corresponding skill when target profile has the skill by id', () => {
      // given
      const skill = domainBuilder.buildSkill();
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });

      // when
      const actualSkill = targetProfile.findSkillById(skill.id);

      // then
      expect(actualSkill).to.deep.equal(skill);
    });

    it('should return undefined when no skills found in target profile by given id', () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'someId' });
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });

      // when
      const actualSkill = targetProfile.findSkillById('someOtherId');

      // then
      expect(actualSkill).to.be.undefined;
    });
  });

});
