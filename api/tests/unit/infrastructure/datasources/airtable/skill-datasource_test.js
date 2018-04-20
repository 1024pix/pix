const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const skillDatasource = require('../../../../../lib/infrastructure/datasources/airtable/skill-datasource');
const skillRawAirTableFixture = require('../../../../fixtures/infrastructure/skillRawAirTableFixture');
const airTableDataModels = require('../../../../../lib/infrastructure/datasources/airtable/models');

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
      sandbox.stub(airtable, 'newGetRecord').resolves(skillRawAirTableFixture());

      // when
      const promise = skillDatasource.get('243');

      // then
      return promise.then((skill) => {
        expect(airtable.newGetRecord).to.have.been.calledWith('Acquis', '243');

        expect(skill).to.be.an.instanceof(airTableDataModels.Skill);
        expect(skill.id).to.equal('recTIddrkopID28Ep');
        expect(skill.name).to.equal('@accesDonnées1');
      });
    });
  });
});
