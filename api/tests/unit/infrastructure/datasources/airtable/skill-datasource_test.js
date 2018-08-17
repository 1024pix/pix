const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const skillRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/skillRawAirTableFixture');
const airTableDataModels = require('../../../../../lib/infrastructure/datasources/airtable/objects');

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
      const airtableSkillObject = skillRawAirTableFixture();
      sandbox.stub(airtable, 'getRecord').resolves(airtableSkillObject);

      // when
      const promise = skillDatasource.get('243');

      // then
      return promise.then((skill) => {
        expect(airtable.getRecord).to.have.been.calledWith('Acquis', '243');

        expect(skill).to.be.an.instanceof(airTableDataModels.Skill);
        expect(skill.id).to.equal(airtableSkillObject.id);
        expect(skill.name).to.equal(airtableSkillObject.get('Nom'));
        expect(skill.hint).to.equal(airtableSkillObject.get('Indice'));
        expect(skill.hintStatus).to.equal(airtableSkillObject.get('Statut de l\'indice'));
        expect(skill.tutorialIds).to.equal(airtableSkillObject.get('Comprendre'));
        expect(skill.learningMoreTutorialIds).to.equal(airtableSkillObject.get('En savoir plus'));
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
          'FIND("recSkillRecordId1", {Record Id}), ' +
          'FIND("recSkillRecordId2", {Record Id})' +
          ')'
        });
      });

    });

    it('should return an array of airtable skill data objects', function() {
      // given
      const airtableSkillObject = skillRawAirTableFixture();
      const requestedSkillRecordIds = ['recTIddrkopID28Ep'];
      sandbox.stub(airtable, 'findRecords').resolves([airtableSkillObject]);

      // when
      const promise = skillDatasource.findByRecordIds(requestedSkillRecordIds);

      // then
      return promise.then((foundSkills) => {
        expect(foundSkills).to.be.an('array');
        expect(foundSkills[0]).to.be.an.instanceOf(airTableDataModels.Skill);
        expect(foundSkills[0].id).to.equal(airtableSkillObject.id);
        expect(foundSkills[0].name).to.equal(airtableSkillObject.fields.Nom);
      });

    });
  });
});
