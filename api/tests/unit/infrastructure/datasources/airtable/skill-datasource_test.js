const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const skillRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/skillRawAirTableFixture');
const { Skill } = require('../../../../../lib/infrastructure/datasources/airtable/objects');
const AirtableRecord = require('airtable').Record;
const _ = require('lodash');

function makeAirtableFake(records) {
  return async (tableName, fieldList) => {
    return records.map((record) => new AirtableRecord(tableName, record.id,
      {
        id: record.id,
        fields: _.pick(record._rawJson.fields, fieldList)
      }));
  };
}

describe('Unit | Infrastructure | Datasource | Airtable | SkillDatasource', () => {

  describe('#get', () => {

    it('should call airtable on Acquis table with the id and return a datamodel Skill object', () => {
      // given
      const rawSkill = skillRawAirTableFixture();
      sinon.stub(airtable, 'getRecord').withArgs('Acquis', rawSkill.id).resolves(rawSkill);

      // when
      const promise = skillDatasource.get(rawSkill.id);

      // then
      return promise.then((skill) => {
        expect(airtable.getRecord).to.have.been.calledWith('Acquis', rawSkill.id);

        expect(skill).to.be.an.instanceof(Skill);
        expect(skill.id).to.equal(rawSkill.id);
      });
    });
  });

  describe('#findByRecordIds', () => {

    it('should return an array of airtable skill data objects -- PARTS II -- ', function() {
      // given
      const rawSkill1 = skillRawAirTableFixture();
      rawSkill1.id = 'FAKE_REC_ID_RAW_SKILL_1' ;

      const rawSkill2 = skillRawAirTableFixture();
      rawSkill2.id = 'FAKE_REC_ID_RAW_SKILL_2' ;

      const rawSkill3 = skillRawAirTableFixture();
      rawSkill3.id = 'FAKE_REC_ID_RAW_SKILL_3' ;

      const rawSkill4 = skillRawAirTableFixture();
      rawSkill4.id = 'FAKE_REC_ID_RAW_SKILL_4' ;
      rawSkill4.fields['Status'] = 'périmé';

      const records = [rawSkill1, rawSkill2, rawSkill3, rawSkill4];
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake(records));

      // when
      const promise = skillDatasource.findByRecordIds([rawSkill1.id, rawSkill2.id, rawSkill4.id]);

      // then
      return promise.then((foundSkills) => {
        expect(foundSkills).to.be.an('array');
        expect(foundSkills[0]).to.be.an.instanceOf(Skill);
        expect(foundSkills[1]).to.be.an.instanceOf(Skill);
        expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
        expect(airtable.findRecords).to.have.been.calledWith('Acquis');

      });
    });
  });

  describe('#list', () => {

    it('should query Airtable skills with empty query', () => {
      // given
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([]));

      sinon.stub(Skill, 'getUsedAirtableFields').returns(['titi', 'toto']);

      // when
      const promise = skillDatasource.list();

      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Acquis', ['titi', 'toto']);
      });
    });

    it('should resolve an array of Skills from airTable', () => {
      // given
      const
        rawSkill1 = skillRawAirTableFixture(),
        rawSkill2 = skillRawAirTableFixture();
      sinon.stub(airtable, 'findRecords').callsFake(makeAirtableFake([rawSkill1, rawSkill2]));

      // when
      const promise = skillDatasource.list();

      // then
      return promise.then((foundSkills) => {
        expect(foundSkills[0]).to.be.an.instanceOf(Skill);
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
      const promise = skillDatasource.list();

      // then
      return promise.then((foundSkills) => {
        expect(foundSkills[0]).to.be.an.instanceOf(Skill);
        expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
      });
    });
  });

  describe('#findByCompetenceId', function() {

    beforeEach(() => {
      const acquix1 = new AirtableRecord('Acquis', 'recAcquix1', { fields: { 'Nom': '@acquix1', 'Status': 'actif', 'Compétence (via Tube)': [ 'recCompetence' ] } });
      const acquix2 = new AirtableRecord('Acquis', 'recAcquix2', { fields: { 'Nom': '@acquix2', 'Status': 'actif', 'Compétence (via Tube)': [ 'recCompetence' ] } });
      const acquix3 = new AirtableRecord('Acquis', 'recAcquix2', { fields: { 'Nom': '@acquix3', 'Status': 'en construction', 'Compétence (via Tube)': [ 'recCompetence' ] } });
      const acquix4 = new AirtableRecord('Acquis', 'recAcquix4', { fields: { 'Nom': '@acquix4', 'Status': 'actif', 'Compétence (via Tube)': [ 'recOtherCompetence' ] } });
      sinon.stub(airtable, 'findRecords')
        .withArgs('Acquis')
        .callsFake(makeAirtableFake([acquix1, acquix2, acquix3, acquix4]));
    });

    it('should retrieve all skills from Airtable for one competence', function() {
      // when
      const promise = skillDatasource.findByCompetenceId('recCompetence');

      // then
      return promise.then((skills) => {
        expect(_.map(skills, 'id')).to.have.members([ 'recAcquix1', 'recAcquix2' ]);
        expect(skills[0]).to.be.an.instanceof(Skill);
      });
    });
  });

});
