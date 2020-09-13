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

  describe('getTargetedCompetences', () => {

    it('should filter the targeted competences from competences passed as argument', () => {
      // given
      const competence1 = domainBuilder.buildCompetence({ id: 'competence1' });
      const competence2 = domainBuilder.buildCompetence({ id: 'competence2' });
      const nonTargetedCompetence = domainBuilder.buildCompetence();
      const skill1 = domainBuilder.buildSkill({ competenceId: competence1.id });
      const skill2 = domainBuilder.buildSkill({ competenceId: competence1.id });
      const skill3 = domainBuilder.buildSkill({ competenceId: competence2.id });
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skill2, skill3] });

      // when
      const targetedCompetences = targetProfile.getTargetedCompetences([competence1, competence2, nonTargetedCompetence]);

      // then
      expect(targetedCompetences).to.exactlyContain([competence1, competence2]);
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

  describe('getSkillCountForCompetence', () => {

    it('should return count of skills within competence in target profile', () => {
      // given
      const competence1 = domainBuilder.buildCompetence({ id: 'competence1' });
      const competence2 = domainBuilder.buildCompetence({ id: 'competence2' });
      const skill1 = domainBuilder.buildSkill({ competenceId: competence1.id });
      const skill2 = domainBuilder.buildSkill({ competenceId: competence1.id });
      const skill3 = domainBuilder.buildSkill({ competenceId: competence2.id });
      const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skill2, skill3] });

      // when
      const skillCountForCompetence = targetProfile.getSkillCountForCompetence(competence1.id);

      // then
      expect(skillCountForCompetence).to.equal(2);
    });
  });

  describe('#getSkillsForCompetence()', () => {
    let expectedSkills;
    let targetProfile;
    const competenceId = 'compId';

    beforeEach(() => {
      const skill1InCompetence = domainBuilder.buildSkill({ competenceId });
      const skill2InCompetence = domainBuilder.buildSkill({ competenceId });
      const otherSkill = domainBuilder.buildSkill({ competenceId: 'otherCompId' });
      targetProfile = domainBuilder.buildTargetProfile({ skills: [ skill1InCompetence, skill2InCompetence, otherSkill ] });
      expectedSkills = [ skill1InCompetence, skill2InCompetence ];
    });

    it('should return skills that are in competence', () => {
      // when
      const skills = targetProfile.getSkillsForCompetence(competenceId);

      // then
      expect(skills).to.deep.equal(expectedSkills);
    });
  });

});
