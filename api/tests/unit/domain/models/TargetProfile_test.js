const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | TargetProfile', () => {

  describe('hasSkill', () => {

    it('should return true when the skill is in target profile', () => {
      // given
      const skill = domainBuilder.buildSkill();
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });

      // when
      const isIncluded = targetProfile.hasSkill(skill.id);

      // then
      expect(isIncluded).to.be.true;
    });

    it('should return false when the skill is not in target profile', () => {
      // given
      const skill = domainBuilder.buildSkill({ id: 'someId' });
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill] });

      // when
      const isIncluded = targetProfile.hasSkill('someOtherId');

      // then
      expect(isIncluded).to.be.false;
    });
  });

  describe('getCompetenceIds', () => {

    it('should return an array with unique competence ids of skills in target profile', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ competenceId: 'competence1' });
      const skill2 = domainBuilder.buildSkill({ competenceId: 'competence2' });
      const skill3 = domainBuilder.buildSkill({ competenceId: 'competence1' });
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skill2, skill3] });

      // when
      const competenceIds = targetProfile.getCompetenceIds();

      // then
      expect(competenceIds).to.exactlyContain(['competence1', 'competence2']);
    });
  });

  describe('getSkillNames', () => {

    it('should return an array with targeted skill names', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ name: 'acquis1' });
      const skill2 = domainBuilder.buildSkill({ name: 'acquis2' });
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skill2] });

      // when
      const targetedSkillNames = targetProfile.getSkillNames();

      // then
      expect(targetedSkillNames).to.exactlyContain(['acquis1', 'acquis2']);
    });
  });

  describe('getSkillIds', () => {

    it('should return an array with targeted skill ids', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ id: 'acquis1' });
      const skill2 = domainBuilder.buildSkill({ id: 'acquis2' });
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skill2] });

      // when
      const targetedSkillIds = targetProfile.getSkillIds();

      // then
      expect(targetedSkillIds).to.exactlyContain(['acquis1', 'acquis2']);
    });
  });

});
