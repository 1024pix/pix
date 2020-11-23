const _ = require('lodash');
const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/learning-content/skill-datasource');
const skillAirtableDataObjectFixture = require('../../../../tooling/fixtures/infrastructure/skillAirtableDataObjectFixture');
const { skillRawAirTableFixture } = require('../../../../tooling/fixtures/infrastructure/skillRawAirTableFixture');
const makeAirtableFake = require('../../../../tooling/airtable-builder/make-airtable-fake');
const cache = require('../../../../../lib/infrastructure/caches/learning-content-cache');

describe('Unit | Infrastructure | Datasource | Airtable | SkillDatasource', () => {

  beforeEach(() => {
    sinon.stub(cache, 'get').callsFake((key, generator) => generator());
  });

  describe('#fromAirTableObject', () => {

    it('should create a Skill from the AirtableRecord', () => {
      // given
      const expectedSkill = skillAirtableDataObjectFixture();

      // when
      const skill = skillDatasource.fromAirTableObject(skillRawAirTableFixture());

      // then
      expect(skill).to.deep.equal(expectedSkill);
    });
  });

  describe('#findOperativeByRecordIds', () => {

    it('should return an array of airtable skill data objects -- PARTS II -- ', async function() {
      // given
      const rawSkill1 = skillRawAirTableFixture({ id: 'FAKE_REC_ID_RAW_SKILL_1' }).withActiveStatus();
      const rawSkill2 = skillRawAirTableFixture({ id: 'FAKE_REC_ID_RAW_SKILL_2' }).withArchivedStatus();
      const rawSkill3 = skillRawAirTableFixture({ id: 'FAKE_REC_ID_RAW_SKILL_3' }).withActiveStatus();
      const rawSkill4 = skillRawAirTableFixture({ id: 'FAKE_REC_ID_RAW_SKILL_4' }).withInactiveStatus();

      const records = [rawSkill1, rawSkill2, rawSkill3, rawSkill4];
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake(records));

      // when
      const foundSkills = await skillDatasource.findOperativeByRecordIds([rawSkill1.id, rawSkill2.id, rawSkill4.id]);

      // then
      expect(foundSkills).to.be.an('array');
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
      expect(airtable.findRecords).to.have.been.calledWith('Acquis');
    });
  });

  describe('#findActive', () => {

    it('should query Airtable skills with empty query', async () => {
      // given
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([]));

      // when
      await skillDatasource.findActive();

      // then
      expect(airtable.findRecords).to.have.been.calledWith('Acquis', skillDatasource.usedFields);
    });

    it('should resolve an array of Skills from airTable', async () => {
      // given
      const
        rawSkill1 = skillRawAirTableFixture(),
        rawSkill2 = skillRawAirTableFixture();
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([rawSkill1, rawSkill2]));

      // when
      const foundSkills = await skillDatasource.findActive();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });

    it('should resolve an array of Skills with only activated Skillfrom airTable', async () => {
      // given
      const
        rawSkill1 = skillRawAirTableFixture().withActiveStatus(),
        rawSkill2 = skillRawAirTableFixture().withActiveStatus(),
        rawSkill3 = skillRawAirTableFixture().withInactiveStatus();
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([rawSkill1, rawSkill2, rawSkill3]));

      // when
      const foundSkills = await skillDatasource.findActive();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });
  });

  describe('#findOperative', () => {

    it('should query Airtable skills with empty query', async () => {
      // given
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([]));

      // when
      await skillDatasource.findOperative();

      // then
      expect(airtable.findRecords).to.have.been.calledWith('Acquis', skillDatasource.usedFields);

    });

    it('should resolve an array of Skills from airTable', async () => {
      // given
      const
        rawSkill1 = skillRawAirTableFixture(),
        rawSkill2 = skillRawAirTableFixture();
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([rawSkill1, rawSkill2]));

      // when
      const foundSkills = await skillDatasource.findOperative();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
    });

    it('should resolve an array of Skills with only activated Skillfrom airTable', async () => {
      // given
      const
        rawSkill1 = skillRawAirTableFixture().withActiveStatus(),
        rawSkill2 = skillRawAirTableFixture().withArchivedStatus(),
        rawSkill3 = skillRawAirTableFixture().withInactiveStatus();
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([rawSkill1, rawSkill2, rawSkill3]));

      // when
      const foundSkills = await skillDatasource.findOperative();

      // then
      expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);

    });
  });

  describe('#findActiveByCompetenceId', function() {

    beforeEach(() => {
      const acquix1 = skillRawAirTableFixture({ id: 'recAcquix1' }).withActiveStatus().withCompetenceId('recCompetence');
      const acquix2 = skillRawAirTableFixture({ id: 'recAcquix2' }).withActiveStatus().withCompetenceId('recCompetence');
      const acquix3 = skillRawAirTableFixture({ id: 'recAcquix3' }).withInactiveStatus().withCompetenceId('recCompetence');
      const acquix4 = skillRawAirTableFixture({ id: 'recAcquix4' }).withActiveStatus().withCompetenceId('recOtherCompetence');
      sinon.stub(airtable, 'findRecords')
        .withArgs('Acquis')
        .callsFake(makeAirtableFake([acquix1, acquix2, acquix3, acquix4]));
    });

    it('should retrieve all skills from Airtable for one competence', async function() {
      // when
      const skills = await skillDatasource.findActiveByCompetenceId('recCompetence');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recAcquix1', 'recAcquix2']);
    });
  });

  describe('#findOperativeByCompetenceId', function() {

    beforeEach(() => {
      const acquix1 = skillRawAirTableFixture({ id: 'recAcquix1' }).withActiveStatus().withCompetenceId('recCompetence');
      const acquix2 = skillRawAirTableFixture({ id: 'recAcquix2' }).withArchivedStatus().withCompetenceId('recCompetence');
      const acquix3 = skillRawAirTableFixture({ id: 'recAcquix3' }).withInactiveStatus().withCompetenceId('recCompetence');
      const acquix4 = skillRawAirTableFixture({ id: 'recAcquix4' }).withActiveStatus().withCompetenceId('recOtherCompetence');
      sinon.stub(airtable, 'findRecords')
        .withArgs('Acquis')
        .callsFake(makeAirtableFake([acquix1, acquix2, acquix3, acquix4]));
    });

    it('should retrieve all skills from Airtable for one competence', async function() {
      // when
      const skills = await skillDatasource.findOperativeByCompetenceId('recCompetence');

      // then
      expect(_.map(skills, 'id')).to.have.members(['recAcquix1', 'recAcquix2']);
    });
  });

});
