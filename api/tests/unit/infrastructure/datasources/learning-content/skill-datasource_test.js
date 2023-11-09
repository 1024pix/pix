import { expect, sinon } from '../../../../test-helper.js';
import _ from 'lodash';
import { skillDatasource } from '../../../../../lib/infrastructure/datasources/learning-content/skill-datasource.js';
import { lcms } from '../../../../../lib/infrastructure/lcms.js';
import { learningContentCache } from '../../../../../lib/infrastructure/caches/learning-content-cache.js';

describe('Unit | Infrastructure | Datasource | LearningContent | SkillDatasource', function () {
  beforeEach(function () {
    sinon.stub(learningContentCache, 'get').callsFake((generator) => generator());
  });

  describe('#findOperativeByRecordIds', function () {
    it('should return an array of skill data objects', async function () {
      // given
      const rawSkill1 = { id: 'recSkill1', status: 'actif' };
      const rawSkill2 = { id: 'recSkill2', status: 'archivé' };
      const rawSkill3 = { id: 'recSkill3', status: 'actif' };
      const rawSkill4 = { id: 'recSkill4', status: 'périmé' };

      const records = [rawSkill1, rawSkill2, rawSkill3, rawSkill4];
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: records });

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
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: records });

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
      sinon
        .stub(lcms, 'getLatestRelease')
        .resolves({ skills: [rawSkill1, rawSkill2, rawSkill3, rawSkill4, rawSkill5] });

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
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [rawSkill1, rawSkill2, rawSkill3] });

      // when
      const result = await skillDatasource.findAllSkillsByNameForPix1d('@rechercher_didacticiel1');

      // then
      expect(result).to.deep.equal([rawSkill1, rawSkill2]);
    });

    context('when there is no skill found', function () {
      it('should return an empty array', async function () {
        // given
        sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [] });

        // when
        const result = await skillDatasource.findAllSkillsByNameForPix1d('@rechercher_validation');

        // then
        expect(result).to.deep.equal([]);
      });
    });
  });

  describe('#findActive', function () {
    it('should query LCMS skills', async function () {
      // given
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [] });

      // when
      await skillDatasource.findActive();

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
    });

    it('should resolve an array of Skills from LCMS', async function () {
      // given
      const rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'actif' };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [rawSkill1, rawSkill2] });

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
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [rawSkill1, rawSkill2, rawSkill3] });

      // when
      const foundSkills = await skillDatasource.findActive();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });
  });

  describe('#findOperative', function () {
    it('should query LCMS skills', async function () {
      // given
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [] });

      // when
      await skillDatasource.findOperative();

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
    });

    it('should resolve an array of Skills from learning content', async function () {
      // given
      const rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'actif' };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [rawSkill1, rawSkill2] });

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
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [rawSkill1, rawSkill2, rawSkill3] });

      // when
      const foundSkills = await skillDatasource.findOperative();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });
  });

  describe('#findActiveByCompetenceId', function () {
    beforeEach(function () {
      const acquix1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence' };
      const acquix2 = { id: 'recSkill2', status: 'actif', competenceId: 'recCompetence' };
      const acquix3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence' };
      const acquix4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence' };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [acquix1, acquix2, acquix3, acquix4] });
    });

    it('should retrieve all skills from learning content for one competence', async function () {
      // when
      const skills = await skillDatasource.findActiveByCompetenceId('recCompetence');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });

  describe('#findActiveByTubeId', function () {
    beforeEach(function () {
      const acquix1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence', tubeId: 'recTube' };
      const acquix2 = { id: 'recSkill2', status: 'actif', competenceId: 'recCompetence', tubeId: 'recTube' };
      const acquix3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence', tubeId: 'recTube' };
      const acquix4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence', tubeId: 'recOtherTube' };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [acquix1, acquix2, acquix3, acquix4] });
    });

    it('should retrieve all skills from learning content for one competence', async function () {
      // when
      const skills = await skillDatasource.findActiveByTubeId('recTube');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });

  describe('#findByTubeIdFor1d', function () {
    beforeEach(function () {
      const acquixActive = { id: 'recSkillActive', status: 'actif', competenceId: 'recCompetence', tubeId: 'recTube' };
      const acquixInBuild = {
        id: 'recSkillInBuild',
        status: 'en construction',
        competenceId: 'recCompetence',
        tubeId: 'recTube',
      };
      const acquixExpired = {
        id: 'recSkillExpired',
        status: 'périmé',
        competenceId: 'recCompetence',
        tubeId: 'recTube',
      };
      const acquixOtherTube = {
        id: 'recSkillOtherTube',
        status: 'actif',
        competenceId: 'recOtherCompetence',
        tubeId: 'recOtherTube',
      };
      sinon
        .stub(lcms, 'getLatestRelease')
        .resolves({ skills: [acquixActive, acquixInBuild, acquixExpired, acquixOtherTube] });
    });

    it('should retrieve all skills from learning content for one competence', async function () {
      // when
      const skills = await skillDatasource.findByTubeIdFor1d('recTube');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkillActive', 'recSkillInBuild']);
    });
  });

  describe('#findOperativeByCompetenceId', function () {
    beforeEach(function () {
      const acquix1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence' };
      const acquix2 = { id: 'recSkill2', status: 'archivé', competenceId: 'recCompetence' };
      const acquix3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence' };
      const acquix4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence' };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [acquix1, acquix2, acquix3, acquix4] });
    });

    it('should retrieve all skills from learning content for one competence', async function () {
      // when
      const skills = await skillDatasource.findOperativeByCompetenceId('recCompetence');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });

  describe('#findOperativeByCompetenceIds', function () {
    beforeEach(function () {
      const acquix1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence1' };
      const acquix2 = { id: 'recSkill2', status: 'archivé', competenceId: 'recCompetence1' };
      const acquix3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence1' };
      const acquix4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence1' };
      const acquix5 = { id: 'recSkill5', status: 'actif', competenceId: 'recCompetence2' };
      const acquix6 = { id: 'recSkill6', status: 'archivé', competenceId: 'recCompetence2' };
      const acquix7 = { id: 'recSkill7', status: 'périmé', competenceId: 'recCompetence2' };
      sinon
        .stub(lcms, 'getLatestRelease')
        .resolves({ skills: [acquix1, acquix2, acquix3, acquix4, acquix5, acquix6, acquix7] });
    });

    it('should retrieve all skills from learning content for competences', async function () {
      // when
      const skills = await skillDatasource.findOperativeByCompetenceIds(['recCompetence1', 'recCompetence2']);

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2', 'recSkill5', 'recSkill6']);
    });
  });

  describe('#findOperativeByTubeId', function () {
    beforeEach(function () {
      const acquix1 = { id: 'recSkill1', status: 'actif', tubeId: 'recTube' };
      const acquix2 = { id: 'recSkill2', status: 'archivé', tubeId: 'recTube' };
      const acquix3 = { id: 'recSkill3', status: 'périmé', tubeId: 'recTube' };
      const acquix4 = { id: 'recSkill4', status: 'actif', tubeId: 'recOtherTube' };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [acquix1, acquix2, acquix3, acquix4] });
    });

    it('should retrieve all operative skills from learning content for one tube', async function () {
      // when
      const skills = await skillDatasource.findOperativeByTubeId('recTube');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });
});
