const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | TargetProfile', () => {

  describe('#hasBadges', () => {

    it('should return true when target profile has badges', () => {
      // given
      const badge = domainBuilder.buildBadge();
      const targetProfile = domainBuilder.buildTargetProfile({ badges: [badge] });

      // then
      expect(targetProfile.hasBadges).to.be.true;
    });

    it('should return false when target profile doesn‘t have badges', () => {
      // given
      const targetProfile = domainBuilder.buildTargetProfile();

      // then
      expect(targetProfile.hasBadges).to.be.false;
    });
  });

  describe('#hasSkill', () => {

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

  describe('#getCompetenceIds', () => {

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

  describe('#getTargetedCompetences', () => {

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

  describe('#getSkillIds', () => {

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

  describe('#getSkillCountForCompetence', () => {

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

  describe('#addOrganizations', () => {
    context('when there is only one each value', ()  => {
      it('add organization to targetProfiles', () => {
        const targetProfile = domainBuilder.buildTargetProfile();
        const organizationIds = [1,2,4,5];

        targetProfile.addOrganizations(organizationIds);

        expect(targetProfile.organizations).to.exactlyContain(organizationIds);
      });
    });
    context('when an organizationId is present several times', ()  => {
      it('add organization to targetProfiles', () => {
        const targetProfile = domainBuilder.buildTargetProfile();

        targetProfile.addOrganizations([1,2,4,1]);
        targetProfile.addOrganizations([2]);

        expect(targetProfile.organizations).to.exactlyContain([1,2,4]);
      });
    });
  });
});
