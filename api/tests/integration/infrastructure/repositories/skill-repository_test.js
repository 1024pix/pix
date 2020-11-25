const { expect, mockLearningContent, domainBuilder } = require('../../../test-helper');
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
});
