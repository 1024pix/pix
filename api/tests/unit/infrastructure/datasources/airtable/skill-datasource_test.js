const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const skillRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/skillRawAirTableFixture');
const { Skill } = require('../../../../../lib/infrastructure/datasources/airtable/objects');
const _ = require('lodash');

describe('Unit | Infrastructure | Datasource | Airtable | SkillDatasource', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#get', () => {

    it('should call airtable on Acquis table with the id and return a datamodel Skill object', () => {
      // given
      const rawSkill = skillRawAirTableFixture();
      sandbox.stub(airtable, 'getRecord').withArgs('Acquis', rawSkill.id).resolves(rawSkill);

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

  describe('#getByRecordIds', function() {

    it('should request skills from airtable API ', function() {
      // given
      const requestedSkillRecordIds = ['recSkillRecordId1', 'recSkillRecordId2'];
      sandbox.stub(airtable, 'findRecords').resolves([]);

      // when
      const promise = skillDatasource.findByRecordIds(requestedSkillRecordIds);

      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Acquis', {
          filterByFormula:
            'OR(' +
            'RECORD_ID()="recSkillRecordId1", ' +
            'RECORD_ID()="recSkillRecordId2"' +
            ')'
        });
      });

    });

    it('should return an array of airtable skill data objects', function() {
      // given
      const rawSkill = skillRawAirTableFixture();
      sandbox.stub(airtable, 'findRecords').resolves([rawSkill]);

      // when
      const promise = skillDatasource.findByRecordIds([rawSkill.id]);

      // then
      return promise.then((foundSkills) => {
        expect(foundSkills).to.be.an('array');
        expect(foundSkills[0]).to.be.an.instanceOf(Skill);
        expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill.id]);
      });

    });
  });

  describe('#list', () => {

    it('should query Airtable skills with empty query', () => {
      // given
      sandbox.stub(airtable, 'findRecords').resolves([]);

      // when
      const promise = skillDatasource.list();

      // then
      return promise.then(() => {
        expect(airtable.findRecords).to.have.been.calledWith('Acquis', {});
      });
    });

    it('should resolve an array of Skills from airTable', () => {
      // given
      const
        rawSkill1 = skillRawAirTableFixture(),
        rawSkill2 = skillRawAirTableFixture();
      sandbox.stub(airtable, 'findRecords').resolves([rawSkill1, rawSkill2]);

      // when
      const promise = skillDatasource.list();

      // then
      return promise.then((foundSkills) => {
        expect(foundSkills[0]).to.be.an.instanceOf(Skill);
        expect(_.map(foundSkills, 'id')).to.deep.equal([rawSkill1.id, rawSkill2.id]);
      });
    });
  });
});
