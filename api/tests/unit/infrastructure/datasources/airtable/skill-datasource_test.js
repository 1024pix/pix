const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const skillRawAirTableFixture = require('../../../../fixtures/infrastructure/skillRawAirTableFixture');
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
});
