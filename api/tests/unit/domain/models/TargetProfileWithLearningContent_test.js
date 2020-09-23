const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | TargetProfileWithLearningContent', () => {

  describe('get#skillNames', () => {

    it('should return an array with targeted skill names order by name', () => {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ name: 'Zacquis1' });
      const skill2 = domainBuilder.buildTargetedSkill({ name: 'Aacquis2' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skill1, skill2] });

      // when
      const targetedSkillNames = targetProfile.skillNames;

      // then
      expect(targetedSkillNames).to.exactlyContainInOrder(['Aacquis2', 'Zacquis1']);
    });
  });

  describe('get#competenceIds', () => {

    it('should return an array with targeted competence ids order by id', () => {
      // given
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'ZCompId' });
      const competence2 = domainBuilder.buildTargetedCompetence({ id: 'ACompId' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ competences: [competence1, competence2] });

      // when
      const targetedCompetenceIds = targetProfile.competenceIds;

      // then
      expect(targetedCompetenceIds).to.exactlyContainInOrder(['ACompId', 'ZCompId']);
    });
  });

  describe('hasSkill', () => {

    it('should return true when the skill is in target profile', () => {
      // given
      const skill = domainBuilder.buildTargetedSkill();
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skill] });

      // when
      const isIncluded = targetProfile.hasSkill(skill.id);

      // then
      expect(isIncluded).to.be.true;
    });

    it('should return false when the skill is not in target profile', () => {
      // given
      const skill = domainBuilder.buildTargetedSkill({ id: 'someId' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skill] });

      // when
      const isIncluded = targetProfile.hasSkill('someOtherId');

      // then
      expect(isIncluded).to.be.false;
    });
  });

  describe('getCompetenceIdOfSkill()', () => {

    const expectedCompetenceId = 'compId';
    const skillId = 'skillId';
    let targetProfile;

    beforeEach(() => {
      const skillNotInCompetence = domainBuilder.buildTargetedSkill({ id: 'otherSkillId', tubeId: 'tube1' });
      const skillInCompetence = domainBuilder.buildTargetedSkill({ id: skillId, tubeId: 'tube2' });
      const tube1 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skillNotInCompetence], competence: 'otherCompId' });
      const tube2 = domainBuilder.buildTargetedTube({ id: 'tube2', skills: [skillInCompetence], competenceId: expectedCompetenceId });
      targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skillNotInCompetence, skillInCompetence], tubes: [tube1, tube2] });
    });

    it('should return competenceId of skill', () => {
      // when
      const competenceId = targetProfile.getCompetenceIdOfSkill(skillId);

      // then
      expect(competenceId).to.equal(expectedCompetenceId);
    });

    it('should return null when competenceId of skill is not found', () => {
      // when
      const competenceId = targetProfile.getCompetenceIdOfSkill('@mamèreenslip');

      // then
      expect(competenceId).to.be.null;
    });
  });

});
