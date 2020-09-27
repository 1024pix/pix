const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | TargetProfileWithLearningContent', () => {

  describe('get#skillNames', () => {

    it('should return an array with targeted skill names', () => {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ name: '@acquis1' });
      const skill2 = domainBuilder.buildTargetedSkill({ name: '@acquis2' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skill1, skill2] });

      // when
      const targetedSkillNames = targetProfile.skillNames;

      // then
      expect(targetedSkillNames).to.exactlyContainInOrder(['@acquis1', '@acquis2']);
    });
  });

  describe('get#skillIds', () => {

    it('should return an array with targeted skill ids', () => {
      // given
      const skill1 = domainBuilder.buildTargetedSkill({ id: 'acquis1' });
      const skill2 = domainBuilder.buildTargetedSkill({ id: 'acquis2' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ skills: [skill1, skill2] });

      // when
      const targetedSkillIds = targetProfile.skillIds;

      // then
      expect(targetedSkillIds).to.exactlyContain(['acquis1', 'acquis2']);
    });
  });

  describe('get#competenceIds', () => {

    it('should return an array with targeted competence ids order by id', () => {
      // given
      const competence1 = domainBuilder.buildTargetedCompetence({ id: 'compId1' });
      const competence2 = domainBuilder.buildTargetedCompetence({ id: 'compId2' });
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ competences: [competence1, competence2] });

      // when
      const targetedCompetenceIds = targetProfile.competenceIds;

      // then
      expect(targetedCompetenceIds).to.exactlyContainInOrder(['compId1', 'compId2']);
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
      const tube1 = domainBuilder.buildTargetedTube({ id: 'tube1', skills: [skillNotInCompetence], competenceId: 'otherCompId' });
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

  describe('getAreaOfCompetence()', () => {

    const competenceId = 'competenceId';
    let expectedArea;
    let targetProfile;

    beforeEach(() => {
      const competenceNotInArea = domainBuilder.buildTargetedCompetence({ id: 'otherCompetenceId', areaId: 'area1' });
      const competenceInArea = domainBuilder.buildTargetedCompetence({ id: competenceId, areaId: 'area2' });
      const area1 = domainBuilder.buildTargetedArea({ id: 'area1', competences: [competenceNotInArea] });
      expectedArea = domainBuilder.buildTargetedArea({ id: 'area2', competences: [competenceInArea] });
      targetProfile = domainBuilder.buildTargetProfileWithLearningContent({ competences: [competenceNotInArea, competenceInArea], areas: [expectedArea, area1] });
    });

    it('should return area of competence', () => {
      // when
      const area = targetProfile.getAreaOfCompetence(competenceId);

      // then
      expect(area).to.deep.equal(expectedArea);
    });

    it('should return null when area of competence is not found', () => {
      // when
      const area = targetProfile.getAreaOfCompetence('recPépite');

      // then
      expect(area).to.be.null;
    });
  });

});
