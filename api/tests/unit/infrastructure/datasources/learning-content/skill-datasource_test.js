const _ = require('lodash');
const { expect, sinon } = require('../../../../test-helper');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/skill-datasource');
const lcms = require('../../../../../lib/infrastructure/lcms');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');

describe('Unit | Infrastructure | Datasource | LearningContent | SkillDatasource', function() {

  beforeEach(function() {
    sinon.stub(cache, 'get').callsFake((key, generator) => generator());
  });

  describe('#findOperativeByRecordIds', function() {

    it('should return an array of skill data objects', async function() {
      // given
      const rawSkill1 = { id: 'recSkill1', status: 'actif' };
      const rawSkill2 = { id: 'recSkill2', status: 'archivé' };
      const rawSkill3 = { id: 'recSkill3', status: 'actif' };
      const rawSkill4 = { id: 'recSkill4', status: 'périmé' };

      const records = [rawSkill1, rawSkill2, rawSkill3, rawSkill4];
      sinon.stub(lcms, 'getCurrentContent').resolves({ skills: records });

      // when
      const foundSkills = await skillDatasource.findOperativeByRecordIds([rawSkill1.id, rawSkill2.id, rawSkill4.id]);

      // then
      expect(foundSkills).to.be.an('array');
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });
  });

  describe('#findByRecordIds', function() {

    it('should return an array of skill data objects', async function() {
      // given
      const rawSkill1 = { id: 'recSkill1', status: 'actif' };
      const rawSkill2 = { id: 'recSkill2', status: 'archivé' };
      const rawSkill3 = { id: 'recSkill3', status: 'actif' };
      const rawSkill4 = { id: 'recSkill4', status: 'périmé' };

      const records = [rawSkill1, rawSkill2, rawSkill3, rawSkill4];
      sinon.stub(lcms, 'getCurrentContent').resolves({ skills: records });

      // when
      const foundSkills = await skillDatasource.findByRecordIds([rawSkill1.id, rawSkill2.id, rawSkill4.id]);

      // then
      expect(foundSkills).to.be.an('array');
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id, rawSkill4.id]);
    });
  });

  describe('#findActive', function() {

    it('should query LCMS skills', async function() {
      // given
      sinon.stub(lcms, 'getCurrentContent').resolves({ skills: [] });

      // when
      await skillDatasource.findActive();

      // then
      expect(lcms.getCurrentContent).to.have.been.called;
    });

    it('should resolve an array of Skills from LCMS', async function() {
      // given
      const
        rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'actif' };
      sinon.stub(lcms, 'getCurrentContent').resolves({ skills: [rawSkill1, rawSkill2] });

      // when
      const foundSkills = await skillDatasource.findActive();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });

    it('should resolve an array of Skills with only activated Skillfrom learning content', async function() {
      // given
      const
        rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'actif' },
        rawSkill3 = { id: 'recSkill3', status: 'périmé' };
      sinon.stub(lcms, 'getCurrentContent').resolves({ skills: [rawSkill1, rawSkill2, rawSkill3] });

      // when
      const foundSkills = await skillDatasource.findActive();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });
  });

  describe('#findOperative', function() {

    it('should query LCMS skills', async function() {
      // given
      sinon.stub(lcms, 'getCurrentContent').resolves({ skills: [] });

      // when
      await skillDatasource.findOperative();

      // then
      expect(lcms.getCurrentContent).to.have.been.called;

    });

    it('should resolve an array of Skills from learning content', async function() {
      // given
      const
        rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'actif' };
      sinon.stub(lcms, 'getCurrentContent').resolves({ skills: [rawSkill1, rawSkill2] });

      // when
      const foundSkills = await skillDatasource.findOperative();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });

    it('should resolve an array of Skills with only activated Skillfrom learning content', async function() {
      // given
      const
        rawSkill1 = { id: 'recSkill1', status: 'actif' },
        rawSkill2 = { id: 'recSkill2', status: 'archivé' },
        rawSkill3 = { id: 'recSkill3', status: 'périmé' };
      sinon.stub(lcms, 'getCurrentContent').resolves({ skills: [rawSkill1, rawSkill2, rawSkill3] });

      // when
      const foundSkills = await skillDatasource.findOperative();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);

    });
  });

  describe('#findActiveByCompetenceId', function() {

    beforeEach(function() {
      const acquix1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence' };
      const acquix2 = { id: 'recSkill2', status: 'actif', competenceId: 'recCompetence' };
      const acquix3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence' };
      const acquix4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence' };
      sinon.stub(lcms, 'getCurrentContent').resolves({ skills: [acquix1, acquix2, acquix3, acquix4] });
    });

    it('should retrieve all skills from learning content for one competence', async function() {
      // when
      const skills = await skillDatasource.findActiveByCompetenceId('recCompetence');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });

  describe('#findOperativeByCompetenceId', function() {

    beforeEach(function() {
      const acquix1 = { id: 'recSkill1', status: 'actif', competenceId: 'recCompetence' };
      const acquix2 = { id: 'recSkill2', status: 'archivé', competenceId: 'recCompetence' };
      const acquix3 = { id: 'recSkill3', status: 'périmé', competenceId: 'recCompetence' };
      const acquix4 = { id: 'recSkill4', status: 'actif', competenceId: 'recOtherCompetence' };
      sinon.stub(lcms, 'getCurrentContent').resolves({ skills: [acquix1, acquix2, acquix3, acquix4] });
    });

    it('should retrieve all skills from learning content for one competence', async function() {
      // when
      const skills = await skillDatasource.findOperativeByCompetenceId('recCompetence');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recSkill1', 'recSkill2']);
    });
  });

});
