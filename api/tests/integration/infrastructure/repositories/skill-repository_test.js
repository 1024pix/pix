import { expect, mockLearningContent, domainBuilder, catchErr } from '../../../test-helper';
import Skill from '../../../../lib/domain/models/Skill';
import skillRepository from '../../../../lib/infrastructure/repositories/skill-repository';
import { NotFoundError } from '../../../../lib/domain/errors';

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
          { ...activeSkill, status: 'actif', level: activeSkill.difficulty },
          { ...archivedSkill, status: 'archivé', level: archivedSkill.difficulty },
          { ...activeSkill_otherCompetence, status: 'actif', level: activeSkill_otherCompetence.difficulty },
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
          { ...activeSkill, status: 'actif', level: activeSkill.difficulty },
          { ...nonActiveSkill, status: 'archivé', level: nonActiveSkill.difficulty },
          { ...activeSkill_otherCompetence, status: 'actif', level: activeSkill_otherCompetence.difficulty },
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
          { ...activeSkill, status: 'actif', level: activeSkill.difficulty },
          { ...archivedSkill, status: 'archivé', level: archivedSkill.difficulty },
          { ...nonOperativeSkill, status: 'BLABLA', level: nonOperativeSkill.difficulty },
          { ...activeSkill_otherCompetence, status: 'actif', level: activeSkill_otherCompetence.difficulty },
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

  describe('#findOperativeByCompetenceIds', function () {
    it('should resolve all skills for all competences', async function () {
      // given
      const competenceId1 = 'recCompetenceId';
      const competenceId2 = 'recCompetenceId';
      const activeSkill1 = domainBuilder.buildSkill({ competenceId: competenceId1 });
      const activeSkill2 = domainBuilder.buildSkill({ competenceId: competenceId2 });
      const archivedSkill = domainBuilder.buildSkill({ competenceId: competenceId1 });
      const nonOperativeSkill = domainBuilder.buildSkill({ competenceId: competenceId1 });
      const activeSkill_otherCompetence = domainBuilder.buildSkill({ competenceId: 'recAnotherCompetence' });
      const learningContent = {
        skills: [
          { ...activeSkill1, status: 'actif', level: activeSkill1.difficulty },
          { ...activeSkill2, status: 'actif', level: activeSkill2.difficulty },
          { ...archivedSkill, status: 'archivé', level: archivedSkill.difficulty },
          { ...nonOperativeSkill, status: 'BLABLA', level: nonOperativeSkill.difficulty },
          { ...activeSkill_otherCompetence, status: 'actif', level: activeSkill_otherCompetence.difficulty },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const skills = await skillRepository.findOperativeByCompetenceIds([competenceId1, competenceId2]);

      // then
      expect(skills).to.have.lengthOf(3);
      expect(skills[0]).to.be.instanceof(Skill);
      expect(skills).to.deep.include.members([activeSkill1, activeSkill2, archivedSkill]);
    });
  });

  describe('#findActiveByTubeId', function () {
    it('should return all active skills in the given tube', async function () {
      // given
      const tubeId = 'recTubeId';
      const activeSkill = domainBuilder.buildSkill({ tubeId });
      const nonActiveSkill = domainBuilder.buildSkill({ tubeId });
      const activeSkill_otherTube = domainBuilder.buildSkill({ tubeId: 'recAnotherTube' });
      const learningContent = {
        skills: [
          { ...activeSkill, status: 'actif', level: activeSkill.difficulty },
          { ...nonActiveSkill, status: 'archivé', level: nonActiveSkill.difficulty },
          { ...activeSkill_otherTube, status: 'actif', level: activeSkill_otherTube.difficulty },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const skills = await skillRepository.findActiveByTubeId(tubeId);

      // then
      expect(skills).to.have.lengthOf(1);
      expect(skills[0]).to.be.instanceof(Skill);
      expect(skills[0]).to.be.deep.equal(activeSkill);
    });
  });

  describe('#findOperativeByTubeId', function () {
    it('should resolve all operative skills for one tube', async function () {
      // given
      const tubeId = 'recTubeId';
      const activeSkill = domainBuilder.buildSkill({ tubeId });
      const archivedSkill = domainBuilder.buildSkill({ tubeId });
      const nonOperativeSkill = domainBuilder.buildSkill({ tubeId });
      const activeSkill_otherTube = domainBuilder.buildSkill({ tubeId: 'recAnotherTube' });
      const learningContent = {
        skills: [
          { ...activeSkill, status: 'actif', level: activeSkill.difficulty },
          { ...archivedSkill, status: 'archivé', level: archivedSkill.difficulty },
          { ...nonOperativeSkill, status: 'BLABLA', level: nonOperativeSkill.difficulty },
          { ...activeSkill_otherTube, status: 'actif', level: activeSkill_otherTube.difficulty },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const skills = await skillRepository.findOperativeByTubeId(tubeId);

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
          { ...activeSkill, status: 'actif', level: activeSkill.difficulty },
          { ...archivedSkill, status: 'archivé', level: archivedSkill.difficulty },
          { ...nonOperativeSkill, status: 'BLABLA', level: nonOperativeSkill.difficulty },
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
        skills: [{ ...skill, level: skill.difficulty }],
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
