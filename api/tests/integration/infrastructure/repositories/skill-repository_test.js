const { expect, mockLearningContent, domainBuilder, databaseBuilder } = require('../../../test-helper');
const Skill = require('../../../../lib/domain/models/Skill');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');

describe('Integration | Repository | skill-repository', () => {

  describe('#list', () => {

    it('should resolve all skills', async () => {
      // given
      const competenceId = 'recCompetenceId';
      const activeSkill = domainBuilder.buildSkill({ competenceId });
      const archivedSkill = domainBuilder.buildSkill({ competenceId });
      const activeSkill_otherCompetence = domainBuilder.buildSkill({ competenceId: 'recAnotherCompetence' });
      const learningContent = {
        skills: [
          { ...activeSkill, status: 'actif' },
          { ...archivedSkill, status: 'archivé' },
          { ...activeSkill_otherCompetence, status: 'actif' },
        ],
      };
      mockLearningContent(learningContent);
      // when
      const skills = await skillRepository.list();

      // then
      expect(skills).to.deep.equal([activeSkill, archivedSkill, activeSkill_otherCompetence]);
    });
  });

  describe('#findActiveByCompetenceId', () => {

    it('should return all skills in the given competence', async () => {
      // given
      const competenceId = 'recCompetenceId';
      const activeSkill = domainBuilder.buildSkill({ competenceId });
      const nonActiveSkill = domainBuilder.buildSkill({ competenceId });
      const activeSkill_otherCompetence = domainBuilder.buildSkill({ competenceId: 'recAnotherCompetence' });
      const learningContent = {
        skills: [
          { ...activeSkill, status: 'actif' },
          { ...nonActiveSkill, status: 'archivé' },
          { ...activeSkill_otherCompetence, status: 'actif' },
        ],
      };
      mockLearningContent(learningContent);
      // when
      const skills = await skillRepository.findActiveByCompetenceId(competenceId);

      // then
      expect(skills).to.have.lengthOf(1);
      expect(skills[0]).to.be.instanceof(Skill);
      expect(skills[0]).to.be.deep.equal(activeSkill);
    });
  });

  describe('#findOperativeByCompetenceId', () => {

    it('should resolve all skills for one competence', async () => {
      // given
      const competenceId = 'recCompetenceId';
      const activeSkill = domainBuilder.buildSkill({ competenceId });
      const archivedSkill = domainBuilder.buildSkill({ competenceId });
      const nonOperativeSkill = domainBuilder.buildSkill({ competenceId });
      const activeSkill_otherCompetence = domainBuilder.buildSkill({ competenceId: 'recAnotherCompetence' });
      const learningContent = {
        skills: [
          { ...activeSkill, status: 'actif' },
          { ...archivedSkill, status: 'archivé' },
          { ...nonOperativeSkill, status: 'BLABLA' },
          { ...activeSkill_otherCompetence, status: 'actif' },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const skills = await skillRepository.findOperativeByCompetenceId(competenceId);

      // then
      expect(skills).to.have.lengthOf(2);
      expect(skills[0]).to.be.instanceof(Skill);
      expect(skills).to.deep.include.members([activeSkill, archivedSkill]);
    });
  });

  describe('#findOperativeByIds', () => {

    it('should resolve all skills passed by ids', async () => {
      // given
      const competenceId = 'recCompetenceId';
      const activeSkill = domainBuilder.buildSkill({ competenceId });
      const archivedSkill = domainBuilder.buildSkill({ competenceId });
      const nonOperativeSkill = domainBuilder.buildSkill({ competenceId });
      const learningContent = {
        skills: [
          { ...activeSkill, status: 'actif' },
          { ...archivedSkill, status: 'archivé' },
          { ...nonOperativeSkill, status: 'BLABLA' },
        ],
      };
      mockLearningContent(learningContent);
      // when
      const skills = await skillRepository.findOperativeByIds([activeSkill.id, archivedSkill.id, nonOperativeSkill.id]);

      // then
      expect(skills).to.have.lengthOf(2);
      expect(skills[0]).to.be.instanceof(Skill);
      expect(skills).to.deep.include.members([activeSkill, archivedSkill]);
    });
  });

  describe('#assessedDuringCampaignParticipation', () => {

    beforeEach(() => {
      const learningContent = {
        skills: [
          { id: 'skill1', status: 'actif' },
          { id: 'skill2', status: 'archivé' },
          { id: 'skill3', status: 'périmé' },
          { id: 'skill4', status: 'actif' },
        ],
      };
      mockLearningContent(learningContent);
    });

    it('returns the id of skills associated to the given target profile', async () => {
      // given
      const { id: campaign1Id, targetProfileId: targetProfile1Id } = databaseBuilder.factory.buildCampaign();
      const { id: campaign2Id, targetProfileId: targetProfile2Id } = databaseBuilder.factory.buildCampaign();
      const { id: campaignParticipationId } = databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign1Id });
      databaseBuilder.factory.buildCampaignParticipation({ campaignId: campaign2Id });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile1Id, skillId: 'skill1' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile1Id, skillId: 'skill2' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile1Id, skillId: 'skill3' });
      databaseBuilder.factory.buildTargetProfileSkill({ targetProfileId: targetProfile2Id, skillId: 'skill4' });

      await databaseBuilder.commit();

      // when
      const skills = await skillRepository.assessedDuringCampaignParticipation(campaignParticipationId);

      // then
      expect(skills).to.exactlyContain(['skill1', 'skill2']);
    });
  });
});
