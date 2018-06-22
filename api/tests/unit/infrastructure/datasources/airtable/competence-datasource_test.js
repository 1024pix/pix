const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const competenceDatasource = require('../../../../../lib/infrastructure/datasources/airtable/competence-datasource');
const competenceRawAirTableFixture = require('../../../../fixtures/infrastructure/competenceRawAirTableFixture');
const airTableDataModels = require('../../../../../lib/infrastructure/datasources/airtable/objects');

describe('Unit | Infrastructure | Datasource | Airtable | CompetenceDatasource', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#get', () => {

    it('should call airtable on Competences table with the id and return a Competence data object', () => {
      // given
      sandbox.stub(airtable, 'getRecord').resolves(competenceRawAirTableFixture());

      // when
      const promise = competenceDatasource.get('243');

      // then
      return promise.then((competence) => {
        expect(airtable.getRecord).to.have.been.calledWith('Competences', '243');

        expect(competence).to.be.an.instanceof(airTableDataModels.Competence);
        expect(competence.id).to.equal('recsvLz0W2ShyfD63');
        expect(competence.title).to.equal('Mener une recherche et une veille d’information');
      });
    });
  });
});
