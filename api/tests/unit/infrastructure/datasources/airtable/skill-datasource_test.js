const AirtableRecord = require('airtable').Record;
const _ = require('lodash');
const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const skillAirtableDataObjectFixture = require('../../../../tooling/fixtures/infrastructure/skillAirtableDataObjectFixture');
const skillRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/skillRawAirTableFixture');
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

  describe('#findByRecordIds', () => {

    it('should return an array of airtable skill data objects -- PARTS II -- ', function() {
      // given
      const rawSkill1 = skillRawAirTableFixture({ id: 'FAKE_REC_ID_RAW_SKILL_1' });
      const rawSkill2 = skillRawAirTableFixture({ id: 'FAKE_REC_ID_RAW_SKILL_2' });
      const rawSkill3 = skillRawAirTableFixture({ id: 'FAKE_REC_ID_RAW_SKILL_3' });
      const rawSkill4 = skillRawAirTableFixture({ id: 'FAKE_REC_ID_RAW_SKILL_4' });
      rawSkill4.fields['Status'] = 'périmé';

      const records = [rawSkill1, rawSkill2, rawSkill3, rawSkill4];
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake(records));

      // when
      const promise = skillDatasource.findByRecordIds([rawSkill1.id, rawSkill2.id, rawSkill4.id]);

      // then
      return promise.then((foundSkills) => {
        expect(foundSkills).to.be.an('array');
        expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
        expect(airtable.findRecords).to.have.been.calledWith('Acquis');

      });
    });
  });

  describe('#findActiveSkills', () => {

    it('should query Airtable skills with empty query', () => {
      // given
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([]));

      // when
      const promise = skillDatasource.findActiveSkills();

      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Acquis', skillDatasource.usedFields);
      });
    });

    it('should resolve an array of Skills from airTable', () => {
      // given
      const
        rawSkill1 = skillRawAirTableFixture(),
        rawSkill2 = skillRawAirTableFixture();
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([rawSkill1, rawSkill2]));

      // when
      const promise = skillDatasource.findActiveSkills();

      // then
      return promise.then((foundSkills) => {
        expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
      });
    });

    it('should resolve an array of Skills with only activated Skillfrom airTable', () => {
      // given
      const
        rawSkill1 = skillRawAirTableFixture(),
        rawSkill2 = skillRawAirTableFixture(),
        rawSkill3 = skillRawAirTableFixture();
      rawSkill3.fields['Status'] = 'périmé';
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([rawSkill1, rawSkill2, rawSkill3]));

      // when
      const promise = skillDatasource.findActiveSkills();

      // then
      return promise.then((foundSkills) => {
        expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
      });
    });
  });

  describe('#findByCompetenceId', function() {

    beforeEach(() => {
      const acquix1 = new AirtableRecord('Acquis', 'recAcquix1', {
        fields: {
          'id persistant': 'recAcquix1',
          'Nom': '@acquix1',
          'Status': 'actif',
          'Compétence (via Tube) (id persistant)': ['recCompetence']
        }
      });
      const acquix2 = new AirtableRecord('Acquis', 'recAcquix2', {
        fields: {
          'id persistant': 'recAcquix2',
          'Nom': '@acquix2',
          'Status': 'actif',
          'Compétence (via Tube) (id persistant)': ['recCompetence']
        }
      });
      const acquix3 = new AirtableRecord('Acquis', 'recAcquix3', {
        fields: {
          'id persistant': 'recAcquix3',
          'Nom': '@acquix3',
          'Status': 'en construction',
          'Compétence (via Tube) (id persistant)': ['recCompetence']
        }
      });
      const acquix4 = new AirtableRecord('Acquis', 'recAcquix4', {
        fields: {
          'id persistant': 'recAcquix4',
          'Nom': '@acquix4',
          'Status': 'actif',
          'Compétence (via Tube) (id persistant)': ['recOtherCompetence']
        }
      });
      sinon.stub(airtable, 'findRecords')
        .withArgs('Acquis')
        .callsFake(makeAirtableFake([acquix1, acquix2, acquix3, acquix4]));
    });

    it('should retrieve all skills from Airtable for one competence', function() {
      // when
      const promise = skillDatasource.findByCompetenceId('recCompetence');

      // then
      return promise.then((skills) => {
        expect(_.map(skills, 'id')).to.have.members(['recAcquix1', 'recAcquix2']);
      });
    });
  });

});
