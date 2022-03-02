const { expect, mockLearningContent, domainBuilder, catchErr } = require('../../../test-helper');
const Skill = require('../../../../lib/domain/models/Skill');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | skill-repository', function () {
  describe('#list', function () {
    it('should resolve all skills', async function () {
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

  describe('#findActiveByCompetenceId', function () {
    it('should return all skills in the given competence', async function () {
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

  describe('#findOperativeByCompetenceId', function () {
    it('should resolve all skills for one competence', async function () {
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

  describe('#findOperativeByIds', function () {
    it('should resolve all skills passed by ids', async function () {
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

  describe('#get', function () {
    let skill;

    beforeEach(function () {
      skill = domainBuilder.buildSkill();
      const learningContent = {
        skills: [skill],
      };
      mockLearningContent(learningContent);
    });

    it('should return a skill by id', async function () {
      // when
      const actualSkill = await skillRepository.get(skill.id);

      // then
      expect(actualSkill).to.deep.equal(skill);
    });

    describe('when skillId is not found', function () {
      it('should throw a Domain error', async function () {
        // when
        const error = await catchErr(skillRepository.get)('skillIdNotFound');

        // then
        expect(error).to.be.instanceOf(NotFoundError).and.have.property('message', 'Erreur, compétence introuvable');
      });
    });
  });
});
