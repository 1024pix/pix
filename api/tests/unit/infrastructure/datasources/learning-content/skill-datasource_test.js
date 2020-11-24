const _ = require('lodash');
const { expect, sinon } = require('../../../../test-helper');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/skill-datasource');
const lcms = require('../../../../../lib/infrastructure/lcms');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');

describe('Unit | Infrastructure | Datasource | Airtable | SkillDatasource', () => {

  beforeEach(() => {
    sinon.stub(cache, 'get').callsFake((key, generator) => generator());
  });

  describe('#findOperativeByRecordIds', () => {

    it('should return an array of skill data objects', async function() {
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

  describe('#findActive', () => {

    it('should query LCMS skills', async () => {
      // given
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [] });

      // when
      await skillDatasource.findActive();

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
    });

    it('should resolve an array of Skills from LCMS', async () => {
      // given
      const
        rawSkill1 = { id: 'recSkill1', status: 'actif'  },
        rawSkill2 = { id: 'recSkill2', status: 'actif'  };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [rawSkill1, rawSkill2] });

      // when
      const foundSkills = await skillDatasource.findActive();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });

    it('should resolve an array of Skills with only activated Skillfrom airTable', async () => {
      // given
      const
        rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'actif' },
        rawSkill3 = { id: 'recSkill3', status: 'périmé' };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [rawSkill1, rawSkill2, rawSkill3] });

      // when
      const foundSkills = await skillDatasource.findActive();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });
  });

  describe('#findOperative', () => {

    it('should query LCMS skills', async () => {
      // given
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [] });

      // when
      await skillDatasource.findOperative();

      // then
      expect(lcms.getLatestRelease).to.have.been.called;

    });

    it('should resolve an array of Skills from airTable', async () => {
      // given
      const
        rawSkill1 = { id: 'recSkill1', status: 'actif'  },
        rawSkill2 = { id: 'recSkill2', status: 'actif'  };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [rawSkill1, rawSkill2] });

      // when
      const foundSkills = await skillDatasource.findOperative();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });

    it('should resolve an array of Skills with only activated Skillfrom airTable', async () => {
      // given
      const
        rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'archivé' },
        rawSkill3 = { id: 'recSkill3', status: 'périmé' };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [rawSkill1, rawSkill2, rawSkill3] });

      // when
      const foundSkills = await skillDatasource.findOperative();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);

    });
  });

  describe('#findActiveByCompetenceId', function() {

    beforeEach(() => {
      const acquix1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence' };
      const acquix2 = { id: 'recSkill2', status: 'actif', competenceId: 'recCompetence' };
      const acquix3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence' };
      const acquix4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence' };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [acquix1, acquix2, acquix3, acquix4] });
    });

    it('should retrieve all skills from Airtable for one competence', async function() {
      // when
      const skills = await skillDatasource.findActiveByCompetenceId('recCompetence');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });

  describe('#findOperativeByCompetenceId', function() {

    beforeEach(() => {
      const acquix1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence' };
      const acquix2 = { id: 'recSkill2', status: 'archivé', competenceId: 'recCompetence' };
      const acquix3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence' };
      const acquix4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence' };
      sinon.stub(lcms, 'getLatestRelease').resolves({ skills: [acquix1, acquix2, acquix3, acquix4] });
    });

    it('should retrieve all skills from Airtable for one competence', async function() {
      // when
      const skills = await skillDatasource.findOperativeByCompetenceId('recCompetence');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });

});
