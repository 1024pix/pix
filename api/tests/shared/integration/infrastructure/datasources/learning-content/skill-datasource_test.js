import _ from 'lodash';

import { skillDatasource } from '../../../../../../src/shared/infrastructure/datasources/learning-content/index.js';
import { expect, mockLearningContent } from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Datasource | LearningContent | SkillDatasource', function () {
  describe('#findOperativeByRecordIds', function () {
    it('should return an array of skill data objects', async function () {
      // given
      const rawSkill1 = { id: 'recSkill1', status: 'actif' };
      const rawSkill2 = { id: 'recSkill2', status: 'archivé' };
      const rawSkill3 = { id: 'recSkill3', status: 'actif' };
      const rawSkill4 = { id: 'recSkill4', status: 'périmé' };

      const records = [rawSkill1, rawSkill2, rawSkill3, rawSkill4];
      await mockLearningContent({ skills: records });

      // when
      const foundSkills = await skillDatasource.findOperativeByRecordIds([rawSkill1.id, rawSkill2.id, rawSkill4.id]);

      // then
      expect(foundSkills).to.be.an('array');
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });
  });

  describe('#findByRecordIds', function () {
    it('should return an array of skill data objects', async function () {
      // given
      const rawSkill1 = { id: 'recSkill1', status: 'actif' };
      const rawSkill2 = { id: 'recSkill2', status: 'archivé' };
      const rawSkill3 = { id: 'recSkill3', status: 'actif' };
      const rawSkill4 = { id: 'recSkill4', status: 'périmé' };

      const records = [rawSkill1, rawSkill2, rawSkill3, rawSkill4];
      await mockLearningContent({ skills: records });

      // when
      const foundSkills = await skillDatasource.findByRecordIds([rawSkill1.id, rawSkill2.id, rawSkill4.id]);

      // then
      expect(foundSkills).to.be.an('array');
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id, rawSkill4.id]);
    });
  });

  describe('#findAllSkillsByNameForPix1d', function () {
    it('should return the corresponding skills', async function () {
      // given
      const rawSkill1 = { id: 'recSkill1', name: '@rechercher_didacticiel1', status: 'actif' };
      const rawSkill2 = { id: 'recSkill2', name: '@rechercher_didacticiel1', status: 'actif' };
      const rawSkill3 = { id: 'recSkill3', name: '@rechercher_entrainement1', status: 'en construction' };
      const rawSkill4 = { id: 'recSkill4', name: '@rechercher_didacticiel2', status: 'actif' };
      const rawSkill5 = { id: 'recSkill5', name: '@rechercher_didacticiel12', status: 'en construction' };
      await mockLearningContent({ skills: [rawSkill1, rawSkill2, rawSkill3, rawSkill4, rawSkill5] });

      // when
      const result = await skillDatasource.findAllSkillsByNameForPix1d('@rechercher_didacticiel1');

      // then
      expect(result).to.deep.equal([rawSkill1, rawSkill2]);
    });

    it('should return the skills with active or building status ', async function () {
      // given
      const rawSkill1 = { id: 'recSkill1', name: '@rechercher_didacticiel1', status: 'actif' };
      const rawSkill2 = { id: 'recSkill2', name: '@rechercher_didacticiel1', status: 'en construction' };
      const rawSkill3 = { id: 'recSkill3', name: '@rechercher_didacticiel1', status: 'archivé' };
      await mockLearningContent({ skills: [rawSkill1, rawSkill2, rawSkill3] });

      // when
      const result = await skillDatasource.findAllSkillsByNameForPix1d('@rechercher_didacticiel1');

      // then
      expect(result).to.deep.equal([rawSkill1, rawSkill2]);
    });

    context('when there is no skill found', function () {
      it('should return an empty array', async function () {
        // given
        await mockLearningContent({ skills: [] });

        // when
        const result = await skillDatasource.findAllSkillsByNameForPix1d('@rechercher_validation');

        // then
        expect(result).to.deep.equal([]);
      });
    });
  });

  describe('#findActive', function () {
    it('should resolve an array of Skills from LCMS', async function () {
      // given
      const rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'actif' };
      await mockLearningContent({ skills: [rawSkill1, rawSkill2] });

      // when
      const foundSkills = await skillDatasource.findActive();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });

    it('should resolve an array of Skills with only activated Skillfrom learning content', async function () {
      // given
      const rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'actif' },
        rawSkill3 = { id: 'recSkill3', status: 'périmé' };
      await mockLearningContent({ skills: [rawSkill1, rawSkill2, rawSkill3] });

      // when
      const foundSkills = await skillDatasource.findActive();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });
  });

  describe('#findOperative', function () {
    it('should resolve an array of Skills from learning content', async function () {
      // given
      const rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'actif' };
      await mockLearningContent({ skills: [rawSkill1, rawSkill2] });

      // when
      const foundSkills = await skillDatasource.findOperative();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });

    it('should resolve an array of Skills with only activated Skillfrom learning content', async function () {
      // given
      const rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'archivé' },
        rawSkill3 = { id: 'recSkill3', status: 'périmé' };
      await mockLearningContent({ skills: [rawSkill1, rawSkill2, rawSkill3] });

      // when
      const foundSkills = await skillDatasource.findOperative();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });
  });

  describe('#findActiveByCompetenceId', function () {
    beforeEach(async function () {
      const skill1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence' };
      const skill2 = { id: 'recSkill2', status: 'actif', competenceId: 'recCompetence' };
      const skill3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence' };
      const skill4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence' };
      await mockLearningContent({ skills: [skill1, skill2, skill3, skill4] });
    });

    it('should retrieve all skills from learning content for one competence', async function () {
      // when
      const skills = await skillDatasource.findActiveByCompetenceId('recCompetence');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });

  describe('#findActiveByTubeId', function () {
    beforeEach(async function () {
      const skill1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence', tubeId: 'recTube' };
      const skill2 = { id: 'recSkill2', status: 'actif', competenceId: 'recCompetence', tubeId: 'recTube' };
      const skill3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence', tubeId: 'recTube' };
      const skill4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence', tubeId: 'recOtherTube' };
      await mockLearningContent({ skills: [skill1, skill2, skill3, skill4] });
    });

    it('should retrieve all skills from learning content for one competence', async function () {
      // when
      const skills = await skillDatasource.findActiveByTubeId('recTube');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });

  describe('#findByTubeIdFor1d', function () {
    beforeEach(async function () {
      const skillActive = { id: 'recSkillActive', status: 'actif', competenceId: 'recCompetence', tubeId: 'recTube' };
      const skillInBuild = {
        id: 'recSkillInBuild',
        status: 'en construction',
        competenceId: 'recCompetence',
        tubeId: 'recTube',
      };
      const skillExpired = {
        id: 'recSkillExpired',
        status: 'périmé',
        competenceId: 'recCompetence',
        tubeId: 'recTube',
      };
      const skillOtherTube = {
        id: 'recSkillOtherTube',
        status: 'actif',
        competenceId: 'recOtherCompetence',
        tubeId: 'recOtherTube',
      };
      await mockLearningContent({ skills: [skillActive, skillInBuild, skillExpired, skillOtherTube] });
    });

    it('should retrieve all skills from learning content for one competence', async function () {
      // when
      const skills = await skillDatasource.findByTubeIdFor1d('recTube');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkillActive', 'recSkillInBuild']);
    });
  });

  describe('#findOperativeByCompetenceId', function () {
    beforeEach(async function () {
      const skill1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence' };
      const skill2 = { id: 'recSkill2', status: 'archivé', competenceId: 'recCompetence' };
      const skill3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence' };
      const skill4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence' };
      await mockLearningContent({ skills: [skill1, skill2, skill3, skill4] });
    });

    it('should retrieve all skills from learning content for one competence', async function () {
      // when
      const skills = await skillDatasource.findOperativeByCompetenceId('recCompetence');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });

  describe('#findOperativeByCompetenceIds', function () {
    beforeEach(async function () {
      const skill1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence1' };
      const skill2 = { id: 'recSkill2', status: 'archivé', competenceId: 'recCompetence1' };
      const skill3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence1' };
      const skill4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence1' };
      const skill5 = { id: 'recSkill5', status: 'actif', competenceId: 'recCompetence2' };
      const skill6 = { id: 'recSkill6', status: 'archivé', competenceId: 'recCompetence2' };
      const skill7 = { id: 'recSkill7', status: 'périmé', competenceId: 'recCompetence2' };
      await mockLearningContent({ skills: [skill1, skill2, skill3, skill4, skill5, skill6, skill7] });
    });

    it('should retrieve all skills from learning content for competences', async function () {
      // when
      const skills = await skillDatasource.findOperativeByCompetenceIds(['recCompetence1', 'recCompetence2']);

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2', 'recSkill5', 'recSkill6']);
    });
  });

  describe('#findOperativeByTubeId', function () {
    beforeEach(async function () {
      const skill1 = { id: 'recSkill1', status: 'actif', tubeId: 'recTube' };
      const skill2 = { id: 'recSkill2', status: 'archivé', tubeId: 'recTube' };
      const skill3 = { id: 'recSkill3', status: 'périmé', tubeId: 'recTube' };
      const skill4 = { id: 'recSkill4', status: 'actif', tubeId: 'recOtherTube' };
      await mockLearningContent({ skills: [skill1, skill2, skill3, skill4] });
    });

    it('should retrieve all operative skills from learning content for one tube', async function () {
      // when
      const skills = await skillDatasource.findOperativeByTubeId('recTube');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });
});
