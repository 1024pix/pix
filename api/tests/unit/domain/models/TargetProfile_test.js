const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | TargetProfile', () => {

  describe('#getSkillsForCompetence()', () => {

    context('when skills for competence are asked for the first time', () => {
      let expectedSkills;
      let targetProfile;
      let competence;

      beforeEach(() => {
        competence = domainBuilder.buildCompetence();
        const skill1InCompetence = domainBuilder.buildSkill({ competenceId: competence.id });
        const skill2InCompetence = domainBuilder.buildSkill({ competenceId: competence.id });
        const otherSkill = domainBuilder.buildSkill({ competenceId: competence.id });
        competence.skillIds = [skill1InCompetence.id, skill2InCompetence.id];
        targetProfile = new TargetProfile({ skills: [ skill1InCompetence, skill2InCompetence, otherSkill ] });
        expectedSkills = [ skill1InCompetence, skill2InCompetence ];
      });

      it('should return skills that are in competence', () => {
        // when
        const skills = targetProfile.getSkillsForCompetence(competence);

        // then
        expect(skills).to.deep.equal(expectedSkills);
      });

      it('should add returned skills in the cache dedicated for memoization', () => {
        // when
        const skills = targetProfile.getSkillsForCompetence(competence);

        // then
        expect(targetProfile.skillsByCompetenceIdCache[competence.id]).to.deep.equal(skills);
      });
    });

    context('when skills for competence are asked consecutive times', () => {
      let expectedSkills;
      let targetProfile;
      let competence;

      beforeEach(() => {
        competence = domainBuilder.buildCompetence();
        const skill1InCompetence = domainBuilder.buildSkill({ competenceId: competence.id });
        const skill2InCompetence = domainBuilder.buildSkill({ competenceId: competence.id });
        const otherSkill = domainBuilder.buildSkill({ competenceId: competence.id });
        competence.skillIds = [skill1InCompetence.id, skill2InCompetence.id];
        targetProfile = new TargetProfile({ skills: [ skill1InCompetence, skill2InCompetence, otherSkill ] });
        expectedSkills = [ skill1InCompetence, skill2InCompetence ];
        targetProfile.getSkillsForCompetence(competence);
      });

      it('should return skills that are in competence', () => {
        // when
        const skills = targetProfile.getSkillsForCompetence(competence);

        // then
        expect(skills).to.deep.equal(expectedSkills);
      });

      it('should not update the cache the cache dedicated for memoization', () => {
        // given
        const skillsBeforeReCall = targetProfile.skillsByCompetenceIdCache[competence.id];

        // when
        targetProfile.getSkillsForCompetence(competence);

        // then
        expect(targetProfile.skillsByCompetenceIdCache[competence.id]).to.deep.equal(skillsBeforeReCall);
      });
    });
  });
});
