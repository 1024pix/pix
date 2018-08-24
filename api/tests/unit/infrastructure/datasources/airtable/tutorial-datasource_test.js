const { expect, sinon } = require('../../../../test-helper');
const airtable = require('../../../../../lib/infrastructure/airtable');
const airTableDataModels = require('../../../../../lib/infrastructure/datasources/airtable/objects');
const tutorialDatasource = require('../../../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const tutorialRawAirTableFixture = require('../../../../tooling/fixtures/infrastructure/tutorialRawAirtableFixture');

describe('Unit | Infrastructure | Datasource | Airtable | TutorialDatasource', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#get', () => {

    it('should call airtable on Tutoriels table with the id and return a datamodel Tutorial object', () => {
      // given
      const givenAirtableTutorial = tutorialRawAirTableFixture();
      sandbox.stub(airtable, 'getRecord').resolves(givenAirtableTutorial);

      // when
      const promise = tutorialDatasource.get(givenAirtableTutorial.getId());

      // then
      return promise.then((tuto) => {
        expect(airtable.getRecord).to.have.been.calledWith('Tutoriels', givenAirtableTutorial.getId());

        expect(tuto).to.be.an.instanceof(airTableDataModels.Tutorial);
        expect(tuto.title).to.equal(givenAirtableTutorial.fields['Titre']);
        expect(tuto.source).to.equal(givenAirtableTutorial.fields['Source']);
      });
    });
  });
});
